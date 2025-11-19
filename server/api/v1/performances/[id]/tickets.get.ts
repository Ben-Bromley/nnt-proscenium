/**
 * GET /api/v1/performances/[id]/tickets
 *
 * Retrieves real-time ticket availability and pricing information for a specific performance.
 * Optimized for frequent polling to provide live updates during booking flow.
 *
 * Route Parameters:
 * @param {string} id - Performance ID
 *
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     performanceId: string,
 *     lastUpdated: string,
 *     totalCapacity: number,
 *     totalAvailable: number,
 *     totalReserved: number,
 *     ticketTypes: {
 *       id: string,
 *       name: string,
 *       description: string | null,
 *       currentPrice: number,
 *       isActive: boolean,
 *       availability: {
 *         available: number,
 *         reserved: number,
 *         collected: number
 *       }
 *     }[]
 *   }
 * }
 *
 * Process:
 * 1. Validates performance ID and active status
 * 2. Fetches current ticket type configurations
 * 3. Calculates real-time availability from reservation data
 * 4. Applies current pricing rules (performance or show level)
 * 5. Returns live availability data
 *
 * Notes:
 * - This endpoint is optimised for frequent polling
 * - Future consideration: WebSocket or Server-Sent Events for live updates
 * - Data is cached briefly to reduce database load
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

    // Check if performance exists and is public
    const performance = await prisma.performance.findUnique({
      where: {
        id: performanceId,
        show: {
          status: 'PUBLISHED',
        },
      },
      select: {
        id: true,
        title: true,
        maxCapacity: true,
        show: {
          select: {
            id: true,
            title: true,
            slug: true,
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

    // Get ticket types with pricing for this performance
    const ticketPrices = await prisma.performanceTicketPrice.findMany({
      where: {
        performanceId,
        isActive: true,
      },
      select: {
        id: true,
        price: true,
        notes: true,
        ticketType: {
          select: {
            id: true,
            name: true,
            description: true,
            defaultPrice: true,
            sortOrder: true,
          },
        },
      },
      orderBy: {
        ticketType: {
          sortOrder: 'asc',
        },
      },
    })

    // If no performance-specific prices, get show-level prices
    let finalTicketPrices = ticketPrices
    if (ticketPrices.length === 0) {
      const showTicketPrices = await prisma.showTicketPrice.findMany({
        where: {
          show: {
            performances: {
              some: { id: performanceId },
            },
          },
          isActive: true,
        },
        select: {
          id: true,
          price: true,
          notes: true,
          ticketType: {
            select: {
              id: true,
              name: true,
              description: true,
              defaultPrice: true,
              sortOrder: true,
            },
          },
        },
        orderBy: {
          ticketType: {
            sortOrder: 'asc',
          },
        },
      })

      finalTicketPrices = showTicketPrices
    }

    // If still no prices, fall back to default ticket types
    if (finalTicketPrices.length === 0) {
      const defaultTicketTypes = await prisma.ticketType.findMany({
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          description: true,
          defaultPrice: true,
          sortOrder: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      })

      finalTicketPrices = defaultTicketTypes.map(ticketType => ({
        id: `default-${ticketType.id}`,
        price: ticketType.defaultPrice,
        notes: null,
        ticketType,
      }))
    }

    // Calculate availability for each ticket type
    const ticketsWithAvailability = await Promise.all(
      finalTicketPrices.map(async (ticketPrice) => {
        const reservedCount = await prisma.reservedTicket.aggregate({
          where: {
            ticketTypeId: ticketPrice.ticketType.id,
            reservation: {
              performanceId,
              status: { notIn: ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_ADMIN'] },
            },
          },
          _sum: { quantity: true },
        })

        const totalReserved = reservedCount._sum.quantity ?? 0

        return {
          ...ticketPrice,
          availability: {
            totalCapacity: performance.maxCapacity,
            reservedForThisType: totalReserved,
            isAvailable: totalReserved < performance.maxCapacity,
          },
        }
      }),
    )

    return successResponse({
      performance: {
        id: performance.id,
        title: performance.title,
        maxCapacity: performance.maxCapacity,
        show: performance.show,
      },
      ticketTypes: ticketsWithAvailability,
    })
  }
  catch (error) {
    return handleApiError(error)
  }
})
