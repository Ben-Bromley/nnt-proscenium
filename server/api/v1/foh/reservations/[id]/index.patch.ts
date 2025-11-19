// Update reservation details
import prisma from '~~/server/database'

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
    const { notes, adminNotes, status } = body

    // Find the reservation first
    const existingReservation = await prisma.reservation.findUnique({
      where: { id: reservationId },
      include: {
        performance: {
          select: {
            startDateTime: true,
            show: { select: { title: true } },
          },
        },
      },
    })

    if (!existingReservation) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Reservation not found',
      })
    }

    // Validate status transitions
    if (status && status !== existingReservation.status) {
      const validTransitions: Record<string, string[]> = {
        PENDING_COLLECTION: ['COLLECTED', 'CANCELLED_BY_ADMIN'],
        COLLECTED: [], // No transitions from collected
        CANCELLED_BY_CUSTOMER: [], // No transitions from customer cancellation
        CANCELLED_BY_ADMIN: ['PENDING_COLLECTION'], // Allow admin to uncancelled
      }

      const allowedStatuses = validTransitions[existingReservation.status] || []
      if (!allowedStatuses.includes(status)) {
        throw createError({
          statusCode: 400,
          statusMessage: `Cannot transition from ${existingReservation.status} to ${status}`,
        })
      }

      // Check if performance has already started (only allow certain operations)
      const now = new Date()
      if (new Date(existingReservation.performance.startDateTime) < now) {
        if (status === 'CANCELLED_BY_ADMIN') {
          throw createError({
            statusCode: 400,
            statusMessage: 'Cannot cancel reservation for performance that has already started',
          })
        }
      }
    }

    // Build update data
    const updateData = {} as Record<string, unknown>

    if (notes !== undefined) {
      updateData.notes = notes
    }

    if (adminNotes !== undefined) {
      updateData.adminNotes = adminNotes
    }

    if (status && status !== existingReservation.status) {
      updateData.status = status
    }

    // Update the reservation
    const updatedReservation = await prisma.reservation.update({
      where: { id: reservationId },
      data: updateData,
      include: {
        performance: {
          include: {
            show: { select: { title: true } },
            venue: { select: { name: true } },
          },
        },
        reservedTickets: {
          include: {
            ticketType: { select: { name: true } },
          },
        },
      },
    })

    return successResponse({
      reservation: updatedReservation,
      message: 'Reservation updated successfully',
    })
  }
  catch (error) {
    return handleApiError(error)
  }
})
