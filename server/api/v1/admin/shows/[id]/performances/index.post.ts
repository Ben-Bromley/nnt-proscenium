/**
 * POST /api/v1/admin/shows/:id/performances
 *
 * Creates a new performance for a specific show.
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

    const body = await readBody(event)

    // Validate required fields
    if (!body.title || !body.startDateTime || !body.endDateTime || !body.maxCapacity) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: title, startDateTime, endDateTime, and maxCapacity',
      })
    }

    // Validate dates
    const startDate = new Date(body.startDateTime)
    const endDate = new Date(body.endDateTime)

    if (startDate >= endDate) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Start date must be before end date',
      })
    }

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
        endDateTime: endDate,
        type: body.type || 'PERFORMANCE',
        details: body.details,
        status: body.status || 'SCHEDULED',
        maxCapacity: Number(body.maxCapacity),
        reservationsOpen: body.reservationsOpen ?? true,
        reservationInstructions: body.reservationInstructions,
        externalBookingLink: body.externalBookingLink,
        showId,
        venueId: body.venueId,
      },
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
