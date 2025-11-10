/**
 * GET /api/v1/performances/[id]
 *
 * Retrieves detailed information for a specific performance including venue,
 * show details, and ticket availability for booking purposes.
 *
 * Route Parameters:
 * @param {string} id - Performance ID
 *
 * Query Parameters:
 * @param {boolean} [includeAvailability=true] - Include ticket availability information
 *
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     performance: {
 *       id: string,
 *       performanceDateTime: string,
 *       doorOpenTime: string | null,
 *       description: string | null,
 *       isActive: boolean,
 *       createdAt: string,
 *       updatedAt: string,
 *       show: {
 *         id: string,
 *         title: string,
 *         slug: string,
 *         description: string,
 *         posterImageUrl: string | null,
 *         ageRating: string | null,
 *         contentWarnings: ContentWarning[]
 *       },
 *       venue: {
 *         id: string,
 *         name: string,
 *         capacity: number,
 *         address: string | null,
 *         features: VenueFeature[]
 *       },
 *       ticketTypes: {
 *         id: string,
 *         name: string,
 *         description: string | null,
 *         defaultPrice: number,
 *         currentPrice: number,
 *         isActive: boolean,
 *         availability?: {
 *           available: number,
 *           total: number
 *         }
 *       }[]
 *     }
 *   }
 * }
 *
 * Process:
 * 1. Validates performance ID
 * 2. Fetches performance with show, venue, and ticket type relations
 * 3. Calculates current pricing based on performance or show-level prices
 * 4. Computes ticket availability if requested
 * 5. Returns complete performance information
 *
 * Error Responses:
 * - 400: Invalid performance ID format
 * - 404: Performance not found or inactive
 * - 500: Internal server error
 */
import prisma from '~~/server/database'

export default defineEventHandler(async (event) => {
  try {
    const performanceId = getRouterParam(event, 'id')

    if (!performanceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Performance ID is required',
      })
    }

    const performance = await prisma.performance.findUnique({
      where: {
        id: performanceId,
        show: {
          status: 'PUBLISHED', // Only show performances for published shows
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
        externalBookingLink: true,
        createdAt: true,
        updatedAt: true,
        show: {
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            posterImageUrl: true,
            programmeUrl: true,
            ageRating: true,
            showTicketPrices: {
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
            contentWarnings: {
              select: {
                notes: true,
                contentWarning: {
                  select: {
                    id: true,
                    name: true,
                    description: true,
                    icon: true,
                  },
                },
              },
            },
          },
        },
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            capacity: true,
            features: {
              where: { isActive: true },
              select: {
                id: true,
                name: true,
                description: true,
                icon: true,
              },
            },
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
    })

    if (!performance) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Performance not found',
      })
    }

    // Calculate availability
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
    const availableTickets = Math.max(0, performance.maxCapacity - totalReserved)

    // Determine which ticket prices to use
    // Priority: 1. Performance-specific prices, 2. Show prices, 3. All active ticket types with default prices
    let ticketPrices = performance.ticketPrices

    if (!ticketPrices || ticketPrices.length === 0) {
      // Check if show has ticket prices
      ticketPrices = performance.show?.showTicketPrices || []
    }

    if (!ticketPrices || ticketPrices.length === 0) {
      // Fall back to all active ticket types with default prices
      const allTicketTypes = await prisma.ticketType.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
          defaultPrice: true,
        },
        orderBy: { sortOrder: 'asc' },
      })

      // Convert to the same format as show/performance prices
      ticketPrices = allTicketTypes.map(tt => ({
        id: `default-${tt.id}`,
        price: tt.defaultPrice,
        notes: null,
        ticketType: {
          id: tt.id,
          name: tt.name,
          description: tt.description,
        },
      }))
    }

    const enrichedPerformance = {
      ...performance,
      show: {
        ...performance.show,
        showTicketPrices: ticketPrices,
      },
      availability: {
        totalCapacity: performance.maxCapacity,
        availableTickets,
        reservedCount: totalReserved,
        isAvailable: availableTickets > 0 && performance.reservationsOpen,
      },
    }

    return successResponse(enrichedPerformance)
  }
  catch (error) {
    return handleApiError(error)
  }
})
