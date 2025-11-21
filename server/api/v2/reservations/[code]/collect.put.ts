import z from 'zod'
import prisma from '~~/server/database'

const bodySchema = z.object({
  adminNotes: z.string().optional(),
})

// PUT /api/v2/reservations/[code]/collect
//
// Marks a reservation as collected. (admin or manager only)
export default defineEventHandler(async (event) => {
  await requireFOHAccess(event)

  const reservationCode = getRouterParam(event, 'code')

  if (!reservationCode) {
    throw createError({
      statusCode: 400,
      message: 'Reservation code is required',
    })
  }

  const body = await readValidatedBody(event, bodySchema.parse)

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

  // Update the reservation status to COLLECTED
  const updatedReservation = await prisma.reservation.update({
    where: { reservationCode },
    data: {
      status: 'COLLECTED',
      adminNotes: body.adminNotes,
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
