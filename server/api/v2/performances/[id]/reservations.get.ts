import prisma from '~~/server/database'

// GET api/v2/performances/:id/reservations
//
// Returns a list of reservations for a specific performance. (admin or manager only)
export default defineEventHandler(async (event) => {
  await requireFOHAccess(event)

  const performanceId = getRouterParam(event, 'id')

  if (!performanceId) {
    throw createError({
      statusCode: 400,
      message: 'Performance ID is required',
    })
  }

  // Verify the performance exists
  const performance = await prisma.performance.findUnique({
    where: { id: performanceId },
    select: { id: true },
  })

  if (!performance) {
    throw createError({
      statusCode: 404,
      message: 'Performance not found',
    })
  }

  const reservations = await prisma.reservation.findMany({
    where: {
      performanceId,
    },
    select: {
      id: true,
      reservationCode: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      status: true,
      notes: true,
      adminNotes: true,
      totalPrice: true,
      reservedTickets: {
        select: {
          id: true,
          quantity: true,
          ticketTypeNameAtReservation: true,
          pricePerItemAtReservation: true,
          ticketTypeId: true,
        },
      },
    },
    orderBy: {
      reservationDateTime: 'desc',
    },
  })

  return reservations
})
