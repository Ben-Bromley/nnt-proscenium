/**
 * GET /api/v1/shows/[slug]/performances
 *
 * Retrieves all performances for a specific show with ticket availability information.
 *
 * Route Parameters:
 * @param {string} slug - URL-friendly show identifier
 *
 * Query Parameters:
 * @param {boolean} [includeAvailability=true] - Include ticket availability counts
 * @param {boolean} [upcomingOnly=true] - Only include upcoming performances
 *
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     performances: Performance[]
 *   }
 * }
 *
 * Performance Object:
 * {
 *   id: string,
 *   showId: string,
 *   venueId: string,
 *   performanceDateTime: string,
 *   doorOpenTime: string | null,
 *   description: string | null,
 *   isActive: boolean,
 *   createdAt: string,
 *   updatedAt: string,
 *   venue: Venue,
 *   ticketTypes: TicketType[],
 *   availability?: {
 *     totalCapacity: number,
 *     availableTickets: number,
 *     reservedCount: number
 *   }
 * }
 *
 * Process:
 * 1. Validates show slug and retrieves show
 * 2. Fetches performances with venue and ticket type relations
 * 3. Calculates availability if requested
 * 4. Returns performance data
 *
 * Error Responses:
 * - 400: Invalid slug format
 * - 404: Show not found
 * - 500: Internal server error
 */
import prisma from '~~/server/database'

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Show slug is required',
      })
    }

    const query = getQuery(event)
    const includeAvailability = query.includeAvailability !== 'false'
    const upcomingOnly = query.upcomingOnly !== 'false'

    // First find the show
    const show = await prisma.show.findUnique({
      where: {
        slug,
        status: 'PUBLISHED', // Only show published shows to public
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
    })

    if (!show) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Show not found',
      })
    }

    // Build performance query
    const performanceWhere: Record<string, unknown> = {
      showId: show.id,
    }

    if (upcomingOnly) {
      performanceWhere.startDateTime = { gte: new Date() }
    }

    const performances = await prisma.performance.findMany({
      where: performanceWhere,
      select: {
        id: true,
        title: true,
        startDateTime: true,
        runtimeMinutes: true,
        intervalMinutes: true,
        type: true,
        details: true,
        maxCapacity: true,
        reservationInstructions: true,
        externalBookingLink: true,
        createdAt: true,
        updatedAt: true,
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            capacity: true,
          },
        },
        ticketPrices: {
          where: { isActive: true },
          select: {
            id: true,
            price: true,
            notes: true,
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
      orderBy: {
        startDateTime: 'asc',
      },
    })

    // Add availability information if requested
    const enrichedPerformances = includeAvailability
      ? await Promise.all(
          performances.map(async (performance) => {
            const reservedCount = await prisma.reservedTicket.aggregate({
              where: {
                reservation: {
                  performanceId: performance.id,
                  status: { notIn: ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_ADMIN'] },
                },
              },
              _sum: { quantity: true },
            })

            const totalReserved = reservedCount._sum.quantity ?? 0
            const availableTickets = performance.maxCapacity - totalReserved

            return {
              ...performance,
              availability: {
                totalCapacity: performance.maxCapacity,
                availableTickets: Math.max(0, availableTickets),
                reservedCount: totalReserved,
              },
            }
          }),
        )
      : performances

    return successResponse({
      show: {
        id: show.id,
        title: show.title,
        slug: show.slug,
      },
      performances: enrichedPerformances,
    })
  }
  catch (error) {
    return handleApiError(error)
  }
})
