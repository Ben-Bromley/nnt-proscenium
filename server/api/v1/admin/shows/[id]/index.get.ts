// Get a show by ID
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

    const show = await prisma.show.findUnique({
      where: { id: showId },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        status: true,
        showType: true,
        posterImageUrl: true,
        programmeUrl: true,
        ageRating: true,
        createdAt: true,
        updatedAt: true,
        performances: {
          select: {
            id: true,
            title: true,
            startDateTime: true,
            runtimeMinutes: true,
            intervalMinutes: true,
            maxCapacity: true,
            venue: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            startDateTime: 'asc',
          },
        },
        contentWarnings: {
          select: {
            notes: true,
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
        induction: {
          select: {
            id: true,
            technicalRequirements: true,
            riskAssessmentCompleted: true,
            riskAssessmentLink: true,
            companyContactName: true,
            companyContactEmail: true,
            companyContactPhone: true,
            inductionNotes: true,
            inductionCompleted: true,
            createdAt: true,
            updatedAt: true,
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

    return successResponse(show)
  }
  catch (error) {
    return handleApiError(error)
  }
})
