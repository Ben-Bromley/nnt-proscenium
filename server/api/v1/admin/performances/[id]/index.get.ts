// Get a performance by ID
import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'ADMIN')

    const performanceId = getRouterParam(event, 'id')

    if (!performanceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Performance ID is required',
      })
    }

    const performance = await prisma.performance.findUnique({
      where: { id: performanceId },
      select: {
        id: true,
        title: true,
        startDateTime: true,
        endDateTime: true,
        type: true,
        details: true,
        status: true,
        maxCapacity: true,
        reservationsOpen: true,
        reservationInstructions: true,
        externalBookingLink: true,
        createdAt: true,
        updatedAt: true,
        show: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
            description: true,
            posterImageUrl: true,
          },
        },
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            capacity: true,
          },
        },
        ticketPrices: {
          select: {
            id: true,
            price: true,
            notes: true,
            isActive: true,
            ticketType: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    })

    if (!performance) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Performance not found',
      })
    }

    // Get reservation statistics
    const [reservedTickets, revenue, reservationCount, reservations] = await Promise.all([
      prisma.reservedTicket.aggregate({
        where: {
          reservation: {
            performanceId: performance.id,
            status: { notIn: ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_ADMIN'] },
          },
        },
        _sum: { quantity: true },
      }),
      prisma.reservation.aggregate({
        where: {
          performanceId: performance.id,
          status: { notIn: ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_ADMIN'] },
        },
        _sum: { totalPrice: true },
      }),
      prisma.reservation.count({
        where: {
          performanceId: performance.id,
          status: { notIn: ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_ADMIN'] },
        },
      }),
      prisma.reservation.findMany({
        where: { performanceId: performance.id },
        select: {
          id: true,
          reservationCode: true,
          customerName: true,
          customerEmail: true,
          status: true,
          totalPrice: true,
          createdAt: true,
          reservedTickets: {
            select: {
              quantity: true,
              ticketTypeNameAtReservation: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 20, // Latest 20 reservations
      }),
    ])

    const totalReserved = reservedTickets._sum.quantity ?? 0
    const totalRevenue = revenue._sum.totalPrice ?? 0
    const availableTickets = Math.max(0, performance.maxCapacity - totalReserved)

    const enrichedPerformance = {
      ...performance,
      statistics: {
        totalReservations: reservationCount,
        totalReserved,
        availableTickets,
        totalRevenue,
        utilizationPercentage: performance.maxCapacity > 0
          ? Math.round((totalReserved / performance.maxCapacity) * 100 * 100) / 100
          : 0,
      },
      recentReservations: reservations,
    }

    return successResponse(enrichedPerformance)
  }
  catch (error) {
    return handleApiError(error)
  }
})
