import { updateContentWarningWithRelations } from '~~/server/utils/database/content-warning'

/**
 * PATCH /api/admin/content-warnings/[id]
 *
 * Updates a specific content warning by its ID.
 * Requires admin authentication.
 *
 * Route Parameters:
 * @param {string} id - Content warning ID
 *
 * Request Body:
 * @param {string} [name] - Updated content warning name
 * @param {string} [description] - Updated description
 * @param {string} [icon] - Updated icon identifier (emoji or icon class name)
 * @param {boolean} [isActive] - Whether this warning is active
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
 *       updatedAt: string
 *     }
 *   }
 * }
 *
 * Validation:
 * - Name must be unique if provided and between 1-100 characters
 * - Description must be less than 500 characters if provided
 * - Icon must be valid emoji or icon identifier if provided
 *
 * Process:
 * 1. Authenticates admin user
 * 2. Validates content warning ID and existence
 * 3. Validates input data
 * 4. Checks for duplicate names if name is being updated
 * 5. Updates content warning with provided fields
 * 6. Returns updated content warning
 *
 * Error Responses:
 * - 400: Invalid input data or content warning ID
 * - 401: Authentication required
 * - 403: Insufficient permissions (admin access required)
 * - 404: Content warning not found
 * - 409: Content warning name already exists
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

    const body = await readBody(event)
    const { name, description, icon, isActive } = body

    // Update content warning using database helper
    const contentWarning = await updateContentWarningWithRelations(contentWarningId, {
      name,
      description,
      icon,
      isActive,
    })

    return successResponse({
      contentWarning,
      message: 'Content warning updated successfully',
    })
  }
  catch (error) {
    return handleApiError(error)
  }
})
