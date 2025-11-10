/**
 * GET /api/v1/admin/content-warnings
 *
 * Retrieves a list of content warnings with pagination, search, and filtering options
 * for admin management. Requires admin authentication.
 *
 * Query Parameters:
 * @param {string} [search] - Search by content warning name or description
 * @param {boolean} [isActive] - Filter by active status (true/false)
 * @param {string} [sortBy='name'] - Sort by field (name, createdAt, updatedAt)
 * @param {string} [sortOrder='asc'] - Sort order 'asc' or 'desc'
 * @param {number} [limit=25] - Number of warnings to return (max 100)
 * @param {number} [offset=0] - Number of warnings to skip for pagination
 * @param {boolean} [includeUsageStats=false] - Include usage statistics
 *
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     contentWarnings: ContentWarning[],
 *     total: number,
 *     limit: number,
 *     offset: number
 *   }
 * }
 *
 * ContentWarning Object:
 * {
 *   id: string,
 *   name: string,
 *   description: string | null,
 *   icon: string | null,
 *   isActive: boolean,
 *   createdAt: string,
 *   updatedAt: string,
 *   usageStats?: {
 *     showCount: number,
 *     lastUsed: string | null
 *   }
 * }
 *
 * Process:
 * 1. Authenticates admin user
 * 2. Validates query parameters
 * 3. Constructs database query with filters and sorting
 * 4. Fetches content warnings
 * 5. Calculates usage statistics if requested
 * 6. Returns paginated content warning list
 *
 * Error Responses:
 * - 400: Invalid query parameters
 * - 401: Authentication required
 * - 403: Insufficient permissions (admin access required)
 * - 500: Internal server error
 */
export default defineEventHandler(async (event) => {
  try {
    // Admin access required
    await requireRole(event, 'ADMIN')

    const query = getQuery(event)

    // Validate pagination and sorting
    const { page, limit, skip } = validatePagination(query)
    const { sortBy, sortOrder } = validateSort(query, [
      'createdAt', 'name', 'updatedAt',
    ])

    // Filter parameters
    const search = query.search as string
    const isActive = query.is_active !== undefined ? query.is_active === 'true' : undefined

    // Get content warnings using database helper
    const { contentWarnings, total } = await getContentWarnings({
      search,
      isActive,
      sortBy: sortBy as 'name' | 'createdAt' | 'updatedAt',
      sortOrder,
      limit,
      skip,
    })

    return paginatedResponse(
      contentWarnings,
      { page, total, limit },
    )
  }
  catch (error) {
    return handleApiError(error)
  }
})
