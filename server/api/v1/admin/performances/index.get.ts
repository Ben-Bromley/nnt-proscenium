/**
 * GET /api/v1/admin/performances
 *
 * Retrieves a list of performances with pagination, search, and filtering options
 * for admin management. Includes detailed performance, show, and venue information.
 * Requires admin authentication.
 *
 * Query Parameters:
 * @param {string} [search] - Search by show title, venue name, or performance description
 * @param {string} [showId] - Filter by specific show ID
 * @param {string} [venueId] - Filter by specific venue ID
 * @param {string} [from] - Filter performances from this date (ISO string)
 * @param {string} [to] - Filter performances up to this date (ISO string)
 * @param {string} [sortBy='performanceDateTime'] - Sort by field
 * @param {string} [sortOrder='asc'] - Sort order 'asc' or 'desc'
 * @param {number} [limit=25] - Number of performances to return (max 100)
 * @param {number} [offset=0] - Number of performances to skip for pagination
 * @param {boolean} [includeInactive=false] - Include soft-deleted performances
 * @param {boolean} [includeStats=true] - Include reservation and revenue statistics
 *
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     performances: Performance[],
 *     total: number,
 *     limit: number,
 *     offset: number
 *   }
 * }
 *
 * Performance Object:
 * {
 *   id: string,
 *   performanceDateTime: string,
 *   doorOpenTime: string | null,
 *   description: string | null,
 *   isActive: boolean,
 *   createdAt: string,
 *   updatedAt: string,
 *   show: {
 *     id: string,
 *     title: string,
 *     slug: string,
 *     status: ShowStatus
 *   },
 *   venue: {
 *     id: string,
 *     name: string,
 *     capacity: number
 *   },
 *   stats?: {
 *     totalReservations: number,
 *     pendingCollections: number,
 *     totalRevenue: number,
 *     capacityUtilization: number
 *   }
 * }
 *
 * Process:
 * 1. Authenticates admin user
 * 2. Validates query parameters
 * 3. Constructs database query with filters and sorting
 * 4. Fetches performances with show and venue relations
 * 5. Calculates statistics if requested
 * 6. Returns paginated performance list
 *
 * Error Responses:
 * - 400: Invalid query parameters
 * - 401: Authentication required
 * - 403: Insufficient permissions (admin access required)
 * - 500: Internal server error
 */
import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'ADMIN')

    const query = getQuery(event)

    // Parse and validate query parameters
    const { page, limit, skip } = validatePagination(query)
    const search = query.search as string || ''
    const showId = query.showId as string || ''
    const venueId = query.venueId as string || ''
    const status = query.status as string || ''
    const upcomingOnly = query.upcomingOnly === 'true'

    // Validate and set sorting
    const allowedSortFields = ['startDateTime', 'createdAt', 'updatedAt', 'title']
    const { sortBy, sortOrder } = validateSort(query, allowedSortFields)

    // Build where clause
    const where: Record<string, unknown> = {}

    // Show filter
    if (showId) {
      where.showId = showId
    }

    // Venue filter
    if (venueId) {
      where.venueId = venueId
    }

    // Status filter
    if (status) {
      where.status = status
    }

    // Upcoming only filter
    if (upcomingOnly) {
      where.startDateTime = { gte: new Date() }
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { details: { contains: search } },
        { show: { title: { contains: search } } },
        { venue: { name: { contains: search } } },
      ]
    }

    // Build orderBy clause
    const orderBy: Record<string, string> = {}
    orderBy[sortBy] = sortOrder

    // Execute queries
    const [performances, total] = await Promise.all([
      prisma.performance.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          startDateTime: true,
          endDateTime: true,
          type: true,
          details: true,
          status: true,
          maxCapacity: true,
          reservationsOpen: true,
          reservationInstructions: true,
          externalBookingLink: true,
          createdAt: true,
          updatedAt: true,
          show: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
            },
          },
          venue: {
            select: {
              id: true,
              name: true,
              address: true,
              capacity: true,
            },
          },
        },
      }),
      prisma.performance.count({ where }),
    ])

    // Enrich with reservation statistics
    const enrichedPerformances = await Promise.all(
      performances.map(async (performance) => {
        const [reservedTickets, revenue, reservationCount] = await Promise.all([
          prisma.reservedTicket.aggregate({
            where: {
              reservation: {
                performanceId: performance.id,
                status: { notIn: ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_ADMIN'] },
              },
            },
            _sum: { quantity: true },
          }),
          prisma.reservation.aggregate({
            where: {
              performanceId: performance.id,
              status: { notIn: ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_ADMIN'] },
            },
            _sum: { totalPrice: true },
          }),
          prisma.reservation.count({
            where: {
              performanceId: performance.id,
              status: { notIn: ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_ADMIN'] },
            },
          }),
        ])

        const totalReserved = reservedTickets._sum.quantity ?? 0
        const totalRevenue = revenue._sum.totalPrice ?? 0
        const availableTickets = Math.max(0, performance.maxCapacity - totalReserved)

        return {
          ...performance,
          statistics: {
            totalReservations: reservationCount,
            totalReserved,
            availableTickets,
            totalRevenue,
            utilizationPercentage: performance.maxCapacity > 0
              ? Math.round((totalReserved / performance.maxCapacity) * 100 * 100) / 100
              : 0,
          },
        }
      }),
    )

    return paginatedResponse(
      enrichedPerformances,
      { page, total, limit },
    )
  }
  catch (error) {
    return handleApiError(error)
  }
})
