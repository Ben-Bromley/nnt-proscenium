/**
 * POST /api/v1/admin/shows
 *
 * Creates a new show with optional initial performances.
 * Requires admin authentication.
 *
 * Request Body:
 * @param {string} title - Show title
 * @param {string} description - Show description
 * @param {ShowType} showType - Type of show
 * @param {string} [posterImageUrl] - URL to poster image
 * @param {string} [programmeUrl] - URL to programme PDF or webpage
 * @param {string} [ageRating] - Age rating (e.g., "12A", "18+")
 * @param {ShowStatus} [status='DRAFT'] - Initial status
 * @param {string[]} [contentWarningIds] - Array of content warning IDs
 * @param {ShowInductionInput} [induction] - Induction information
 * @param {PerformanceInput[]} [performances] - Initial performances to create
 *
 * ShowInductionInput:
 * {
 *   technicalRequirements?: string,
 *   companyContactName?: string,
 *   companyContactEmail?: string,
 *   companyContactPhone?: string,
 *   inductionNotes?: string
 * }
 *
 * PerformanceInput:
 * {
 *   venueId: string,
 *   performanceDateTime: string,
 *   doorOpenTime?: string,
 *   description?: string
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     show: {
 *       id: string,
 *       title: string,
 *       slug: string,
 *       description: string,
 *       status: ShowStatus,
 *       showType: ShowType,
 *       posterImageUrl: string | null,
 *       programmeUrl: string | null,
 *       ageRating: string | null,
 *       createdAt: string,
 *       updatedAt: string,
 *       contentWarnings: ContentWarning[],
 *       induction: ShowInduction | null,
 *       performances: Performance[]
 *     }
 *   }
 * }
 *
 * Process:
 * 1. Authenticates admin user
 * 2. Validates input data and generates unique slug
 * 3. Creates show record with transaction
 * 4. Links content warnings if provided
 * 5. Creates induction record if provided
 * 6. Creates initial performances if provided
 * 7. Returns complete show data
 *
 * Error Responses:
 * - 400: Invalid input data or slug conflict
 * - 401: Authentication required
 * - 403: Insufficient permissions (admin access required)
 * - 409: Show title or slug already exists
 * - 500: Internal server error
 */
import prisma from '~~/server/database'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'ADMIN')

    const body = await readBody(event)

    // Validate request body using Zod schema
    const validatedData = showCreateSchema.parse(body)

    // Check if show with same slug already exists
    const existingShow = await prisma.show.findUnique({
      where: { slug: validatedData.slug },
    })

    if (existingShow) {
      throw createError({
        statusCode: 409,
        statusMessage: `A show with the slug "${validatedData.slug}" already exists`,
      })
    }

    // Create the show
    const show = await prisma.show.create({
      data: validatedData,
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
      },
    })

    return successResponse(
      show,
      `Show "${show.title}" created successfully`,
    )
  }
  catch (error) {
    return handleApiError(error)
  }
})
