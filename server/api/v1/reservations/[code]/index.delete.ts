/**
 * DELETE /api/v1/reservations/[code]
 *
 * Cancels a reservation by its public code. Allows customers to cancel
 * their own reservations before collection. Sets status to CANCELLED_BY_CUSTOMER.
 *
 * Route Parameters:
 * @param {string} code - Public reservation code
 *
 * Request Body:
 * @param {string} [reason] - Optional cancellation reason
 *
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     reservation: {
 *       id: string,
 *       reservationCode: string,
 *       status: ReservationStatus,
 *       cancelledAt: string
 *     }
 *   }
 * }
 *
 * Restrictions:
 * - Only PENDING_COLLECTION reservations can be cancelled
 * - Cancellation may have time restrictions (e.g., not within 2 hours of performance)
 * - Rate limited to prevent abuse (I'm pretty certain cloudflare deals with this for us)
 *
 * Process:
 * 1. Validates reservation code and current status
 * 2. Checks cancellation policy and time restrictions
 * 3. Updates reservation status to CANCELLED_BY_CUSTOMER
 * 4. Releases ticket inventory back to available pool
 * 5. Sends cancellation confirmation email
 * 6. Returns cancellation confirmation
 *
 * Error Responses:
 * - 400: Invalid reservation code
 * - 404: Reservation not found
 * - 409: Reservation cannot be cancelled (wrong status or too late)
 * - 429: Too many cancellation requests
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

    // Find the reservation
    const reservation = await prisma.reservation.findUnique({
      where: { reservationCode },
      select: {
        id: true,
        status: true,
        customerName: true,
        performance: {
          select: {
            id: true,
            title: true,
            startDateTime: true,
            show: {
              select: {
                title: true,
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

    // Check if reservation can be cancelled
    if (reservation.status === 'CANCELLED_BY_CUSTOMER' || reservation.status === 'CANCELLED_BY_ADMIN') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Reservation is already cancelled',
      })
    }

    if (reservation.status === 'COLLECTED') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot cancel a reservation that has already been collected',
      })
    }

    // Check if performance has already started
    if (reservation.performance.startDateTime <= new Date()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot cancel reservation for a performance that has already started',
      })
    }

    // Update reservation status to cancelled
    const cancelledReservation = await prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        status: 'CANCELLED_BY_CUSTOMER',
        updatedAt: new Date(),
      },
      select: {
        id: true,
        reservationCode: true,
        status: true,
        customerName: true,
        updatedAt: true,
      },
    })

    return successResponse(
      cancelledReservation,
      `Reservation ${reservationCode} has been successfully cancelled`,
    )
  }
  catch (error) {
    return handleApiError(error)
  }
})
