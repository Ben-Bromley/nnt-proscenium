/**
 * GET /api/foh/performances/today
 *
 * Retrieves all performances scheduled for today with reservation summaries
 * for Front of House staff. Requires FOH staff authentication.
 *
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     date: string, // Today's date in ISO format
 *     performances: Performance[]
 *   }
 * }
 *
 * Performance Object:
 * {
 *   id: string,
 *   performanceDateTime: string,
 *   doorOpenTime: string | null,
 *   details: string | null,
 *   show: {
 *     id: string,
 *     title: string,
 *     description: string | null,
 *     posterImageUrl: string | null,
 *     ageRating: string | null
 *   },
 *   venue: {
 *     id: string,
 *     name: string,
 *     capacity: number
 *   },
 *   reservationSummary: {
 *     totalReservations: number,
 *     pendingCollection: number,
 *     collected: number,
 *     cancelled: number,
 *     totalRevenue: number,
 *     expectedRevenue: number
 *   }
 * }
 *
 * Process:
 * 1. Authenticates FOH staff member
 * 2. Determines today's date in venue timezone
 * 3. Fetches all performances for today
 * 4. Aggregates reservation statistics for each performance
 * 5. Returns today's schedule with reservation summaries
 *
 * Error Responses:
 * - 401: Authentication required
 * - 403: Insufficient permissions (FOH access required)
 * - 500: Internal server error
 */
import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    // FOH access requires ADMIN or MANAGER role
    await requireFOHAccess(event)

    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)

    const performances = await prisma.performance.findMany({
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
        type: true,
        details: true,
        status: true,
        maxCapacity: true,
        reservationsOpen: true,
        reservationInstructions: true,
        show: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            posterImageUrl: true,
            ageRating: true,
          },
        },
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
      orderBy: {
        startDateTime: 'asc',
      },
    })

    // Enrich with reservation statistics
    const enrichedPerformances = await Promise.all(
      performances.map(async (performance) => {
        const [reservationStats, ticketStats] = await Promise.all([
          prisma.reservation.groupBy({
            by: ['status'],
            where: {
              performanceId: performance.id,
            },
            _count: {
              status: true,
            },
          }),
          prisma.reservedTicket.aggregate({
            where: {
              reservation: {
                performanceId: performance.id,
                status: { notIn: ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_ADMIN'] },
              },
            },
            _sum: { quantity: true },
          }),
        ])

        const totalReserved = ticketStats._sum.quantity ?? 0
        const availableCapacity = Math.max(0, performance.maxCapacity - totalReserved)

        const statusCounts = reservationStats.reduce((acc, stat) => {
          acc[stat.status] = stat._count.status
          return acc
        }, {} as Record<string, number>)

        return {
          ...performance,
          reservationSummary: {
            totalReservations: reservationStats.reduce((sum, stat) => sum + stat._count.status, 0),
            pendingCollection: statusCounts.PENDING_COLLECTION ?? 0,
            collected: statusCounts.COLLECTED ?? 0,
            cancelled: (statusCounts.CANCELLED_BY_CUSTOMER ?? 0) + (statusCounts.CANCELLED_BY_ADMIN ?? 0),
            totalTicketsReserved: totalReserved,
            availableCapacity,
            utilizationPercentage: performance.maxCapacity > 0
              ? Math.round((totalReserved / performance.maxCapacity) * 100)
              : 0,
          },
        }
      }),
    )

    return successResponse({
      date: today.toISOString().split('T')[0],
      performances: enrichedPerformances,
      summary: {
        totalPerformances: enrichedPerformances.length,
        totalReservations: enrichedPerformances.reduce(
          (sum, p) => sum + p.reservationSummary.totalReservations,
          0,
        ),
        totalPendingCollection: enrichedPerformances.reduce(
          (sum, p) => sum + p.reservationSummary.pendingCollection,
          0,
        ),
      },
    })
  }
  catch (error) {
    return handleApiError(error)
  }
})
