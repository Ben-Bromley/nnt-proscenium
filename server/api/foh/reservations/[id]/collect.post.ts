// mark reservation as status as collected
import { collectReservation } from '~~/server/utils/database/reservation'

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

    const body = await readBody(event)
    const { notes } = body

    // Use the database helper to collect the reservation
    const updatedReservation = await collectReservation(
      reservationId,
      notes || undefined,
    )

    return successResponse({
      reservation: updatedReservation,
      message: 'Reservation collected successfully',
    })
  }
  catch (error) {
    return handleApiError(error)
  }
})
