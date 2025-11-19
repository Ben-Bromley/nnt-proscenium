// Get reservation details by ID
export default defineEventHandler(async (event) => {
  try {
    // FOH access requires ADMIN or MANAGER role
    await requireFOHAccess(event)

    const reservationId = getRouterParam(event, 'id')
    if (!reservationId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Reservation ID is required',
      })
    }

    // Find the reservation with full details using helper
    const reservation = await getReservationById(reservationId, true)

    // Add calculated fields (only if reservation has relations loaded)
    const totalTickets = 'reservedTickets' in reservation
      ? reservation.reservedTickets.reduce((sum: number, ticket) => sum + ticket.quantity, 0)
      : 0
    const subtotal = 'reservedTickets' in reservation
      ? reservation.reservedTickets.reduce((sum: number, ticket) => sum + (ticket.quantity * ticket.pricePerItemAtReservation), 0)
      : 0

    const enrichedReservation = {
      ...reservation,
      totalTickets,
      subtotal,
    }

    return successResponse(enrichedReservation)
  }
  catch (error) {
    return handleApiError(error)
  }
})
