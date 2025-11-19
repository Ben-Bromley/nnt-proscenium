/**
 * POST /api/v1/admin/shows/:id/performances
 *
 * Creates a new performance for a specific show.
 * Requires admin authentication.
 */
import prisma from '~~/server/database'

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

    const body = await readBody(event)

    // Validate required fields
    if (!body.title || !body.startDateTime || body.runtimeMinutes === undefined || !body.maxCapacity) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: title, startDateTime, runtimeMinutes, and maxCapacity',
      })
    }

    // Validate dates
    const startDate = new Date(body.startDateTime)

    // Check if show exists
    const show = await prisma.show.findUnique({
      where: { id: showId },
      select: { id: true, title: true, status: true },
    })

    if (!show) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Show not found',
      })
    }

    // Check if venue exists (if provided)
    if (body.venueId) {
      const venue = await prisma.venue.findUnique({
        where: { id: body.venueId },
        select: { id: true, name: true, isActive: true },
      })

      if (!venue || !venue.isActive) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Venue not found or inactive',
        })
      }
    }

    // Create the performance
    const performance = await prisma.performance.create({
      data: {
        title: body.title,
        startDateTime: startDate,
        runtimeMinutes: Number(body.runtimeMinutes),
        intervalMinutes: Number(body.intervalMinutes || 0),
        type: body.type || 'PERFORMANCE',
        details: body.details,
        maxCapacity: Number(body.maxCapacity),
        reservationInstructions: body.reservationInstructions,
        externalBookingLink: body.externalBookingLink,
        showId,
        venueId: body.venueId,
      },
      select: {
        id: true,
        title: true,
        startDateTime: true,
        runtimeMinutes: true,
        intervalMinutes: true,
        type: true,
        details: true,
        maxCapacity: true,
        reservationInstructions: true,
        externalBookingLink: true,
        createdAt: true,
        show: {
          select: {
            id: true,
            title: true,
            slug: true,
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

    return successResponse(
      performance,
      `Performance "${performance.title}" created successfully`,
    )
  }
  catch (error) {
    return handleApiError(error)
  }
})
