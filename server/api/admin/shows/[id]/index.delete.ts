// Delete a show by ID
import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    // Admin access required
    await requireRole(event, 'ADMIN')

    const showId = getRouterParam(event, 'id')
    if (!showId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Show ID is required',
      })
    }

    // Find the show and check for dependencies
    const show = await prisma.show.findUnique({
      where: { id: showId },
      include: {
        performances: {
          include: {
            reservations: {
              select: { id: true, status: true },
            },
          },
        },
      },
    })

    if (!show) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Show not found',
      })
    }

    // Check for active reservations
    const activeReservations = show.performances.flatMap(p =>
      p.reservations.filter(r =>
        r.status !== 'CANCELLED_BY_CUSTOMER' && r.status !== 'CANCELLED_BY_ADMIN',
      ),
    )

    if (activeReservations.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot delete show with ${activeReservations.length} active reservations. Cancel all reservations first.`,
      })
    }

    // Check for upcoming performances
    const upcomingPerformances = show.performances.filter(p =>
      new Date(p.startDateTime) > new Date(),
    )

    if (upcomingPerformances.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Cannot delete show with ${upcomingPerformances.length} upcoming performances. Delete all future performances first.`,
      })
    }

    // Cancel the show (soft delete)
    const deletedShow = await prisma.show.update({
      where: { id: showId },
      data: {
        status: 'CANCELLED',
      },
    })

    return successResponse({
      show: deletedShow,
      message: 'Show cancelled successfully',
    })
  }
  catch (error) {
    return handleApiError(error)
  }
})
