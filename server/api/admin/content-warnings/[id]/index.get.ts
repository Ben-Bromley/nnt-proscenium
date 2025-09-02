/**
 * GET /api/admin/content-warnings/[id]
 *
 * Retrieves a specific content warning by its ID with detailed information.
 * Requires admin authentication.
 *
 * Route Parameters:
 * @param {string} id - Content warning ID
 *
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     contentWarning: {
 *       id: string,
 *       name: string,
 *       description: string | null,
 *       icon: string | null,
 *       isActive: boolean,
 *       createdAt: string,
 *       updatedAt: string,
 *       shows: {
 *         id: string,
 *         title: string,
 *         slug: string
 *       }[]
 *     }
 *   }
 * }
 *
 * Process:
 * 1. Authenticates admin user
 * 2. Validates content warning ID
 * 3. Fetches content warning with usage statistics
 * 4. Returns content warning details
 *
 * Error Responses:
 * - 400: Invalid content warning ID
 * - 401: Authentication required
 * - 403: Insufficient permissions (admin access required)
 * - 404: Content warning not found
 * - 500: Internal server error
 */
export default defineEventHandler(async (event) => {
  try {
    // Admin access required
    await requireRole(event, 'ADMIN')

    const contentWarningId = getRouterParam(event, 'id')
    if (!contentWarningId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Content warning ID is required',
      })
    }

    // Get content warning using database helper
    const contentWarning = await getContentWarningWithRelations(contentWarningId)

    return successResponse({
      contentWarning,
    })
  }
  catch (error) {
    return handleApiError(error)
  }
})
