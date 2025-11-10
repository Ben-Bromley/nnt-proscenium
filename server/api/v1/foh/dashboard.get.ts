/**
 * GET /api/v1/foh/dashboard
 *
 * Retrieves dashboard information for Front of House (FOH) staff for today's overview.
 * Requires FOH staff authentication.
 *
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     todaysPerformances: Performance[],
 *     totalReservations: number,
 *     pendingCollections: number,
 *     totalRevenue: number,
 *     venueCapacityUtilization: {
 *       [venueId: string]: {
 *         venueName: string,
 *         totalCapacity: number,
 *         reservedTickets: number,
 *         utilizationPercentage: number
 *       }
 *     },
 *     recentActivity: RecentActivity[]
 *   }
 * }
 *
 * RecentActivity:
 * {
 *   id: string,
 *   type: 'reservation_created' | 'tickets_collected' | 'reservation_cancelled',
 *   timestamp: string,
 *   details: string,
 *   reservationCode?: string
 * }
 *
 * Process:
 * 1. Authenticates FOH staff member
 * 2. Fetches today's performances and related data
 * 3. Calculates reservation statistics
 * 4. Computes venue capacity utilization
 * 5. Retrieves recent reservation activity
 * 6. Returns dashboard data
 *
 * Error Responses:
 * - 401: Authentication required
 * - 403: Insufficient permissions (FOH access required)
 * - 500: Internal server error
 */
import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    // FOH dashboard requires ADMIN or MANAGER role
    await requireFOHAccess(event)

    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

    // Get today's performances
    const todaysPerformances = await prisma.performance.findMany({
      where: {
        startDateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
        show: {
          status: 'PUBLISHED',
        },
      },
      select: {
        id: true,
        title: true,
        startDateTime: true,
        endDateTime: true,
        maxCapacity: true,
        status: true,
        show: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        venue: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        startDateTime: 'asc',
      },
    })

    // Get reservation statistics for today
    const [totalReservations, pendingCollections, totalRevenue] = await Promise.all([
      prisma.reservation.count({
        where: {
          performance: {
            startDateTime: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          status: { notIn: ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_ADMIN'] },
        },
      }),
      prisma.reservation.count({
        where: {
          performance: {
            startDateTime: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          status: 'PENDING_COLLECTION',
        },
      }),
      prisma.reservation.aggregate({
        where: {
          performance: {
            startDateTime: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          status: { notIn: ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_ADMIN'] },
        },
        _sum: {
          totalPrice: true,
        },
      }),
    ])

    // Calculate venue capacity utilization for today's performances
    const venueUtilization = []

    for (const performance of todaysPerformances) {
      const reservedTickets = await prisma.reservedTicket.aggregate({
        where: {
          reservation: {
            performanceId: performance.id,
            status: { notIn: ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_ADMIN'] },
          },
        },
        _sum: { quantity: true },
      })

      const reserved = reservedTickets._sum.quantity ?? 0
      const utilizationPercentage = performance.maxCapacity > 0
        ? Math.round((reserved / performance.maxCapacity) * 100 * 100) / 100
        : 0

      venueUtilization.push({
        performanceId: performance.id,
        performanceTitle: performance.title,
        showTitle: performance.show?.title || 'Unknown Show',
        venueName: performance.venue?.name || 'Unknown Venue',
        totalCapacity: performance.maxCapacity,
        reservedTickets: reserved,
        utilizationPercentage,
      })
    }

    // Get recent activity (last 10 reservations from today)
    const recentActivity = await prisma.reservation.findMany({
      where: {
        performance: {
          startDateTime: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      },
      select: {
        id: true,
        reservationCode: true,
        customerName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        performance: {
          select: {
            title: true,
            show: {
              select: {
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: 10,
    })

    const dashboardData = {
      todaysPerformances,
      totalReservations,
      pendingCollections,
      totalRevenue: totalRevenue._sum.totalPrice ?? 0,
      venueCapacityUtilization: venueUtilization,
      recentActivity: recentActivity.map(activity => ({
        id: activity.id,
        type: activity.status === 'COLLECTED'
          ? 'tickets_collected'
          : activity.status.startsWith('CANCELLED')
            ? 'reservation_cancelled'
            : 'reservation_created',
        reservationCode: activity.reservationCode,
        customerName: activity.customerName,
        performanceTitle: activity.performance.title,
        showTitle: activity.performance.show?.title,
        timestamp: activity.updatedAt,
      })),
    }

    return successResponse(dashboardData)
  }
  catch (error) {
    return handleApiError(error)
  }
})
