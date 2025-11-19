// Publish (or unpublish) a show
import prisma from '~~/server/database'

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

    // Find the show and validate it can be published
    const show = await prisma.show.findUnique({
      where: { id: showId },
      include: {
        performances: {
          select: {
            id: true,
            startDateTime: true,
          },
        },
        showTicketPrices: {
          include: {
            ticketType: {
              select: { name: true },
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

    if (show.status === 'PUBLISHED') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Show is already published',
      })
    }

    // Validation requirements for publishing
    const validationErrors: string[] = []

    // Must have title and description
    if (!show.title?.trim()) {
      validationErrors.push('Show must have a title')
    }

    if (!show.description?.trim()) {
      validationErrors.push('Show must have a description')
    }

    // Must have at least one upcoming performance
    const upcomingPerformances = show.performances.filter(p =>
      new Date(p.startDateTime) > new Date(),
    )

    if (upcomingPerformances.length === 0) {
      validationErrors.push('Show must have at least one upcoming performance')
    }

    // Must have ticket pricing configured
    const activeTicketPrices = show.showTicketPrices.filter(p => p.isActive)
    if (activeTicketPrices.length === 0) {
      validationErrors.push('Show must have at least one active ticket price configured')
    }

    // Must have age rating
    if (!show.ageRating) {
      validationErrors.push('Show must have an age rating')
    }

    if (validationErrors.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot publish show: ' + validationErrors.join('; '),
      })
    }

    // Update show status to published
    const publishedShow = await prisma.show.update({
      where: { id: showId },
      data: {
        status: 'PUBLISHED',
      },
      include: {
        contentWarnings: {
          include: {
            contentWarning: {
              select: {
                id: true,
                name: true,
                description: true,
                icon: true,
              },
            },
          },
        },
        showTicketPrices: {
          include: {
            ticketType: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        performances: {
          where: {
            startDateTime: { gt: new Date() },
          },
          orderBy: {
            startDateTime: 'asc',
          },
          include: {
            venue: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    })

    return successResponse({
      show: publishedShow,
      message: 'Show published successfully',
    })
  }
  catch (error) {
    return handleApiError(error)
  }
})
