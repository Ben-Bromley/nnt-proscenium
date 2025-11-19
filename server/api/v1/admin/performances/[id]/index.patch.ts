/**
 * PATCH /api/v1/admin/performances/:id
 *
 * Updates a performance by ID.
 * Requires admin authentication.
 */
import prisma from '~~/server/database'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'ADMIN')

    const performanceId = getRouterParam(event, 'id')
    if (!performanceId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Performance ID is required',
      })
    }

    const body = await readBody(event)

    // Validate runtime if provided
    if (body.runtimeMinutes !== undefined && body.runtimeMinutes < 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Runtime must be a positive number',
      })
    }

    // Check if performance exists
    const existingPerformance = await prisma.performance.findUnique({
      where: { id: performanceId },
      select: { id: true, showId: true },
    })

    if (!existingPerformance) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Performance not found',
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

    // Update the performance
    const performance = await prisma.performance.update({
      where: { id: performanceId },
      data: {
        ...(body.title && { title: body.title }),
        ...(body.startDateTime && { startDateTime: new Date(body.startDateTime) }),
        ...(body.runtimeMinutes !== undefined && { runtimeMinutes: Number(body.runtimeMinutes) }),
        ...(body.intervalMinutes !== undefined && { intervalMinutes: Number(body.intervalMinutes) }),
        ...(body.type && { type: body.type }),
        ...(body.details !== undefined && { details: body.details }),
        ...(body.maxCapacity !== undefined && { maxCapacity: Number(body.maxCapacity) }),
        ...(body.reservationInstructions !== undefined && { reservationInstructions: body.reservationInstructions }),
        ...(body.externalBookingLink !== undefined && { externalBookingLink: body.externalBookingLink }),
        ...(body.venueId !== undefined && { venueId: body.venueId }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
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
        updatedAt: true,
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
      `Performance "${performance.title}" updated successfully`,
    )
  }
  catch (error) {
    return handleApiError(error)
  }
})
