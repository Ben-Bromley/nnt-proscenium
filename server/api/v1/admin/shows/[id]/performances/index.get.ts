/**
 * GET /api/v1/admin/shows/:id/performances
 *
 * Retrieves all performances for a specific show.
 * Requires admin authentication.
 */
import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'ADMIN')

    const showId = getRouterParam(event, 'id')
    if (!showId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Show ID is required',
      })
    }

    // Verify show exists
    const show = await prisma.show.findUnique({
      where: { id: showId },
      select: { id: true, title: true },
    })

    if (!show) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Show not found',
      })
    }

    // Fetch all performances for this show
    const performances = await prisma.performance.findMany({
      where: { showId },
      orderBy: { startDateTime: 'asc' },
      select: {
        id: true,
        title: true,
        startDateTime: true,
        endDateTime: true,
        type: true,
        details: true,
        status: true,
        maxCapacity: true,
        reservationsOpen: true,
        reservationInstructions: true,
        externalBookingLink: true,
        createdAt: true,
        updatedAt: true,
        venue: {
          select: {
            id: true,
            name: true,
            address: true,
            capacity: true,
          },
        },
        _count: {
          select: {
            reservations: true,
          },
        },
      },
    })

    return successResponse({ performances })
  }
  catch (error) {
    return handleApiError(error)
  }
})
