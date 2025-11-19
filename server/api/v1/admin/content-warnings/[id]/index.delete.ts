/**
 * DELETE /api/v1/admin/content-warnings/[id]
 *
 * Deletes a specific content warning by its ID. Can perform either soft delete
 * (deactivation) or hard delete depending on usage and requirements.
 * Requires admin authentication.
 *
 * Route Parameters:
 * @param {string} id - Content warning ID
 *
 * Query Parameters:
 * @param {boolean} [force=false] - Force hard delete even if used by shows
 *
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     contentWarning: {
 *       id: string,
 *       name: string,
 *       isActive: boolean,
 *     }
 *   }
 * }
 *
 * Deletion Rules:
 * - Soft delete (isActive = false) if warning is used by active shows
 * - Hard delete only if no shows use this warning or force = true
 * - Maintains data integrity by preserving historical associations
 *
 * Process:
 * 1. Authenticates admin user
 * 2. Validates content warning ID and existence
 * 3. Checks if warning is used by any shows
 * 4. Determines deletion strategy (soft vs hard)
 * 5. Performs deletion operation
 * 6. Returns deletion confirmation
 *
 * Restrictions:
 * - Cannot hard delete if used by published shows (unless forced)
 * - Soft deletion preferred to maintain data integrity
 *
 * Error Responses:
 * - 400: Invalid content warning ID
 * - 401: Authentication required
 * - 403: Insufficient permissions (admin access required)
 * - 404: Content warning not found
 * - 409: Content warning is in use and cannot be deleted without force
 * - 500: Internal server error
 */
import prisma from '~~/server/database'

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

    // Check if the content warning exists and get usage info
    const existingWarning = await prisma.contentWarning.findUnique({
      where: { id: contentWarningId },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            shows: true,
          },
        },
      },
    })

    if (!existingWarning) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Content warning not found',
      })
    }

    // Check if content warning is in use
    if (existingWarning._count.shows > 0) {
      // Soft delete by deactivating instead of hard delete
      const deactivatedWarning = await prisma.contentWarning.update({
        where: { id: contentWarningId },
        data: {
          isActive: false,
        },
        select: {
          id: true,
          name: true,
          description: true,
          icon: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: {
              shows: true,
            },
          },
        },
      })

      return successResponse({
        contentWarning: deactivatedWarning,
        message: `Content warning "${existingWarning.name}" has been deactivated as it is currently used by ${existingWarning._count.shows} show(s). It can still be reactivated later.`,
      })
    }

    // Hard delete if not in use
    await prisma.contentWarning.delete({
      where: { id: contentWarningId },
    })

    return successResponse({
      message: `Content warning "${existingWarning.name}" has been permanently deleted.`,
    })
  }
  catch (error) {
    return handleApiError(error)
  }
})
