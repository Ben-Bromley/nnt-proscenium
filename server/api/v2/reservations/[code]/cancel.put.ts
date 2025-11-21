import prisma from '~~/server/database'

// PUT /api/v2/reservations/[code]/cancel.put.ts
//
// Cancels a reservation. (admin or manager only) TODO: allow users to cancel their own reservations
export default defineEventHandler(async (event) => {
  await requireFOHAccess(event)

  const reservationCode = getRouterParam(event, 'code')

  if (!reservationCode) {
    throw createError({
      statusCode: 400,
      message: 'Reservation code is required',
    })
  }

  // Find the reservation
  const reservation = await prisma.reservation.findUnique({
    where: { reservationCode },
    select: { id: true, status: true },
  })

  if (!reservation) {
    throw createError({
      statusCode: 404,
      message: 'Reservation not found',
    })
  }

  // Update the reservation status to CANCELLED_BY_ADMIN
  const updatedReservation = await prisma.reservation.update({
    where: { reservationCode },
    data: {
      status: 'CANCELLED_BY_ADMIN',
    },
    select: {
      id: true,
      reservationCode: true,
      status: true,
      customerName: true,
      totalPrice: true,
    },
  })

  return updatedReservation
})
