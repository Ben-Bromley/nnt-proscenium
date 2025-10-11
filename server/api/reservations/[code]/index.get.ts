/**
 * GET /api/reservations/[code]
 *
 * Retrieves detailed information for a specific reservation using its public code.
 * No authentication required - accessible to customers with the reservation code.
 *
 * Route Parameters:
 * @param {string} code - Public reservation code
 *
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     reservation: {
 *       id: string,
 *       reservationCode: string,
 *       totalPrice: number,
 *       status: ReservationStatus,
 *       reservationDateTime: string,
 *       collectionDeadline: string | null,
 *       customerName: string,
 *       customerEmail: string,
 *       notes: string | null,
 *       performance: {
 *         id: string,
 *         performanceDateTime: string,
 *         doorOpenTime: string | null,
 *         show: {
 *           title: string,
 *           slug: string,
 *           posterImageUrl: string | null,
 *           ageRating: string | null,
 *           contentWarnings: ContentWarning[]
 *         },
 *         venue: {
 *           name: string,
 *           address: string | null
 *         }
 *       },
 *       reservedTickets: {
 *         id: string,
 *         quantity: number,
 *         pricePerItemAtReservation: number,
 *         ticketTypeNameAtReservation: string
 *       }[]
 *     }
 *   }
 * }
 *
 * Process:
 * 1. Validates reservation code format
 * 2. Searches for reservation with public-safe relations
 * 3. Filters out internal information (admin notes, etc.)
 * 4. Returns customer-facing reservation details
 *
 * Error Responses:
 * - 400: Invalid reservation code format
 * - 404: Reservation not found
 * - 500: Internal server error
 */
import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const reservationCode = getRouterParam(event, 'code')

    if (!reservationCode) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Reservation code is required',
      })
    }

    const reservation = await prisma.reservation.findUnique({
      where: { reservationCode },
      select: {
        id: true,
        reservationCode: true,
        totalPrice: true,
        reservationDateTime: true,
        status: true,
        notes: true,
        collectionDeadline: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        createdAt: true,
        updatedAt: true,
        performance: {
          select: {
            id: true,
            title: true,
            startDateTime: true,
            endDateTime: true,
            details: true,
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
        },
        reservedTickets: {
          select: {
            id: true,
            quantity: true,
            pricePerItemAtReservation: true,
            ticketTypeNameAtReservation: true,
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

    if (!reservation) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Reservation not found',
      })
    }

    // Calculate totals
    const ticketsSummary = reservation.reservedTickets.map(ticket => ({
      ...ticket,
      totalPrice: ticket.pricePerItemAtReservation * ticket.quantity,
    }))

    const calculatedTotal = ticketsSummary.reduce(
      (sum, ticket) => sum + ticket.totalPrice,
      0,
    )

    return successResponse({
      ...reservation,
      reservedTickets: ticketsSummary,
      calculatedTotal,
    })
  }
  catch (error) {
    return handleApiError(error)
  }
})
