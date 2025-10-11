/**
 * POST /api/reservations
 *
 * Creates a new ticket reservation for a performance. No authentication required for guest reservations.
 *
 * Request Body:
 * @param {string} performanceId - ID of the performance to reserve tickets for
 * @param {ReservedTicketInput[]} tickets - Array of ticket types and quantities to reserve
 * @param {string} customerName - Customer's full name
 * @param {string} customerEmail - Customer's email address
 * @param {string} [customerPhone] - Customer's phone number (optional)
 * @param {string} [notes] - Customer notes or special requests
 * @param {string} [userId] - User ID if authenticated (optional)
 *
 * ReservedTicketInput:
 * {
 *   ticketTypeId: string,
 *   quantity: number
 * }
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
 *       collectionDeadline: string | null,
 *       customerName: string,
 *       customerEmail: string,
 *       reservedTickets: ReservedTicket[],
 *       performance: {
 *         id: string,
 *         performanceDateTime: string,
 *         venue: Venue,
 *         show: Show
 *       }
 *     }
 *   }
 * }
 *
 * Process:
 * 1. Validates input data and performance availability
 * 2. Checks ticket availability for requested quantities
 * 3. Calculates total price based on current pricing
 * 4. Creates reservation with PENDING_COLLECTION status
 * 5. Sends confirmation email to customer
 * 6. Returns reservation details
 *
 * Error Responses:
 * - 400: Invalid input data or insufficient ticket availability
 * - 404: Performance or ticket types not found
 * - 409: Requested tickets no longer available
 * - 500: Internal server error
 */
import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)

    // Basic validation TODO: replace with zod schema validation
    if (!body.performanceId || !body.customerName || !body.customerEmail || !body.tickets?.length) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: performanceId, customerName, customerEmail, and tickets',
      })
    }

    // Check if performance exists and is available for reservations
    const performance = await prisma.performance.findUnique({
      where: { id: body.performanceId },
      select: {
        id: true,
        title: true,
        startDateTime: true,
        maxCapacity: true,
        reservationsOpen: true,
        status: true,
        show: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        venue: {
          select: {
            id: true,
            name: true,
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

    if (performance.show?.status !== 'PUBLISHED') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Reservations are not available for this show',
      })
    }

    if (!performance.reservationsOpen) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Reservations are not open for this performance',
      })
    }

    // Check capacity
    const currentReservations = await prisma.reservedTicket.aggregate({
      where: {
        reservation: {
          performanceId: body.performanceId,
          status: { notIn: ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_ADMIN'] },
        },
      },
      _sum: { quantity: true },
    })

    const totalReserved = currentReservations._sum.quantity ?? 0
    const requestedQuantity = body.tickets.reduce((sum: number, ticket: { quantity?: number }) => sum + (ticket.quantity || 0), 0)

    if (totalReserved + requestedQuantity > performance.maxCapacity) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Not enough tickets available for this performance',
      })
    }

    // Generate reservation code
    const reservationCode = Math.random().toString(36).substring(2, 8).toUpperCase()

    // Calculate total price and create reservation with tickets
    const reservation = await prisma.$transaction(async (tx) => {
      let calculatedTotalPrice = 0

      // Pre-calculate total price
      for (const ticketRequest of body.tickets) {
        const ticketType = await tx.ticketType.findUnique({
          where: { id: ticketRequest.ticketTypeId },
          select: { defaultPrice: true },
        })

        if (!ticketType) {
          throw new Error(`Ticket type not found: ${ticketRequest.ticketTypeId}`)
        }

        calculatedTotalPrice += ticketType.defaultPrice * ticketRequest.quantity
      }

      // Create reservation
      const newReservation = await tx.reservation.create({
        data: {
          performanceId: body.performanceId,
          customerName: body.customerName,
          customerEmail: body.customerEmail,
          customerPhone: body.customerPhone,
          notes: body.notes,
          reservationCode,
          totalPrice: calculatedTotalPrice,
          status: 'PENDING_COLLECTION',
        },
        select: {
          id: true,
          reservationCode: true,
          customerName: true,
          customerEmail: true,
          totalPrice: true,
          status: true,
          createdAt: true,
        },
      })

      // Create reserved tickets
      for (const ticketRequest of body.tickets) {
        const ticketType = await tx.ticketType.findUnique({
          where: { id: ticketRequest.ticketTypeId },
          select: { defaultPrice: true, name: true },
        })

        if (ticketType) {
          await tx.reservedTicket.create({
            data: {
              reservationId: newReservation.id,
              ticketTypeId: ticketRequest.ticketTypeId,
              quantity: ticketRequest.quantity,
              pricePerItemAtReservation: ticketType.defaultPrice,
              ticketTypeNameAtReservation: ticketType.name,
            },
          })
        }
      }

      return newReservation
    })

    return successResponse(
      {
        ...reservation,
        performance: {
          id: performance.id,
          title: performance.title,
          startDateTime: performance.startDateTime,
          show: performance.show,
          venue: performance.venue,
        },
      },
      `Reservation ${reservation.reservationCode} created successfully`,
    )
  }
  catch (error) {
    return handleApiError(error)
  }
})
