import { getTicketTypesWithCount } from '~~/server/utils/database/ticket'

/**
 * GET /api/admin/tickets
 *
 * Retrieves all ticket types with pagination, sorting, and filtering options
 * for admin management. Requires admin authentication.
 *
 * Query Parameters:
 * @param {string} [search] - Search by ticket type name or description
 * @param {boolean} [isActive] - Filter by active status (true/false)
 * @param {string} [priceRange] - Filter by predefined price ranges (0-5, 5-10, 10-15, 15-20, 20+)
 * @param {number} [minPrice] - Filter by minimum price (overrides priceRange)
 * @param {number} [maxPrice] - Filter by maximum price (overrides priceRange)
 * @param {string} [sortBy='name'] - Sort by field (name, defaultPrice, createdAt)
 * @param {string} [sortOrder='asc'] - Sort order 'asc' or 'desc'
 * @param {number} [limit=25] - Number of ticket types to return (max 100)
 * @param {number} [offset=0] - Number of ticket types to skip for pagination
 * @param {boolean} [includeUsageStats=false] - Include usage statistics
 *
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     ticketTypes: TicketType[],
 *     total: number,
 *     limit: number,
 *     offset: number
 *   }
 * }
 *
 * TicketType Object:
 * {
 *   id: string,
 *   name: string,
 *   description: string | null,
 *   defaultPrice: number,
 *   isActive: boolean,
 *   createdAt: string,
 *   updatedAt: string,
 *   usageStats?: {
 *     totalReservations: number,
 *     activeShows: number,
 *     totalRevenue: number
 *   }
 * }
 *
 * Process:
 * 1. Authenticates admin user
 * 2. Validates query parameters
 * 3. Uses database helper for consistent filtering and sorting
 * 4. Returns paginated ticket type list
 *
 * Error Responses:
 * - 400: Invalid query parameters
 * - 401: Authentication required
 * - 403: Insufficient permissions (admin access required)
 * - 500: Internal server error
 */
export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'ADMIN')

    const query = getQuery(event)

    // Parse and validate query parameters
    const { page, limit, skip } = validatePagination(query)
    const search = query.search as string || ''
    const isActive = query.isActive === undefined ? undefined : query.isActive === 'true'
    const priceRange = query.priceRange as string || ''
    const minPrice = query.minPrice ? parseFloat(query.minPrice as string) : undefined
    const maxPrice = query.maxPrice ? parseFloat(query.maxPrice as string) : undefined

    // Validate and set sorting
    const allowedSortFields = ['createdAt', 'updatedAt', 'name', 'defaultPrice', 'sortOrder']
    const { sortBy, sortOrder } = validateSort(query, allowedSortFields)

    // Use database helper for consistent querying
    const { ticketTypes, total } = await getTicketTypesWithCount({
      search: search || undefined,
      isActive,
      priceRange: priceRange || undefined,
      minPrice,
      maxPrice,
      sortBy: sortBy as 'name' | 'defaultPrice' | 'createdAt' | 'updatedAt' | 'sortOrder',
      sortOrder,
      limit,
      skip,
    })

    return paginatedResponse(
      ticketTypes,
      { page, total, limit },
    )
  }
  catch (error) {
    return handleApiError(error)
  }
})
