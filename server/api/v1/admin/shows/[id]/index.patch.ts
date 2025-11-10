// Update a show by ID
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

    const body = await readBody(event)
    const {
      title,
      slug,
      description,
      status,
      ageRating,
      posterImageUrl,
      trailerVideoUrl,
      contentWarnings,
      ticketPricing,
    } = body

    // Validate the show exists
    const existingShow = await prisma.show.findUnique({
      where: { id: showId },
      include: {
        contentWarnings: true,
        showTicketPrices: true,
      },
    })

    if (!existingShow) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Show not found',
      })
    }

    // Check if slug is unique (if being changed)
    if (slug && slug !== existingShow.slug) {
      const slugExists = await prisma.show.findUnique({
        where: { slug },
      })
      if (slugExists) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Slug already exists',
        })
      }
    }

    // Validate status transition
    if (status && status !== existingShow.status) {
      // Don't allow unpublishing if there are upcoming performances
      if (existingShow.status === 'PUBLISHED' && status !== 'PUBLISHED') {
        const upcomingPerformances = await prisma.performance.count({
          where: {
            showId,
            startDateTime: { gt: new Date() },
          },
        })

        if (upcomingPerformances > 0) {
          throw createError({
            statusCode: 400,
            statusMessage: 'Cannot change status of show with upcoming performances',
          })
        }
      }
    }

    // Update show in transaction to handle related data
    // Build array of operations for batch transaction (D1 compatible)
    const operations = []

    // Update basic show information
    operations.push(
      prisma.show.update({
        where: { id: showId },
        data: {
          ...(title && { title }),
          ...(slug && { slug }),
          ...(description !== undefined && { description }),
          ...(status && { status }),
          ...(ageRating && { ageRating }),
          ...(posterImageUrl !== undefined && { posterImageUrl }),
          ...(trailerVideoUrl !== undefined && { trailerVideoUrl }),
        },
      }),
    )

    // Handle content warnings if provided
    if (contentWarnings !== undefined) {
      // Remove existing content warnings
      operations.push(
        prisma.showContentWarning.deleteMany({
          where: { showId },
        }),
      )

      // Add new content warnings
      if (contentWarnings.length > 0) {
        operations.push(
          prisma.showContentWarning.createMany({
            data: contentWarnings.map((warning: { contentWarningId: string, notes?: string }) => ({
              showId,
              contentWarningId: warning.contentWarningId,
              notes: warning.notes,
            })),
          }),
        )
      }
    }

    // Handle ticket pricing if provided
    if (ticketPricing !== undefined) {
      // Remove existing ticket prices
      operations.push(
        prisma.showTicketPrice.deleteMany({
          where: { showId },
        }),
      )

      // Add new ticket prices
      if (ticketPricing.length > 0) {
        operations.push(
          prisma.showTicketPrice.createMany({
            data: ticketPricing.map((pricing: { ticketTypeId: string, price: number, isActive?: boolean, notes?: string }) => ({
              showId,
              ticketTypeId: pricing.ticketTypeId,
              price: pricing.price,
              isActive: pricing.isActive ?? true,
              notes: pricing.notes,
            })),
          }),
        )
      }
    }

    // Execute all operations in a batch transaction
    await prisma.$transaction(operations)

    // Fetch the updated show with all relationships
    const showWithDetails = await prisma.show.findUnique({
      where: { id: showId },
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
      },
    })

    return successResponse({
      show: showWithDetails,
      message: 'Show updated successfully',
    })
  }
  catch (error) {
    return handleApiError(error)
  }
})
