/**
 * GET /api/v1/foh/reservations
 *
 * Retrieves a list of reservations for FOH staff with search and filter options.
 * Requires FOH staff authentication.
 *
 * Query Parameters:
 * @param {string} [search] - Search by reservation code, customer name, or email
 * @param {ReservationStatus} [status] - Filter by reservation status
 * @param {string} [performanceId] - Filter by specific performance
 * @param {string} [date] - Filter by performance date (YYYY-MM-DD)
 * @param {string} [sortBy='reservationDateTime'] - Sort by field
 * @param {string} [sortOrder='desc'] - Sort order 'asc' or 'desc'
 * @param {number} [limit=25] - Number of reservations to return (max 100)
 * @param {number} [offset=0] - Number of reservations to skip for pagination
 *
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     reservations: Reservation[],
 *     total: number,
 *     limit: number,
 *     offset: number,
 *     statusCounts: {
 *       [status: string]: number
 *     }
 *   }
 * }
 *
 * Reservation Object:
 * {
 *   id: string,
 *   reservationCode: string,
 *   totalPrice: number,
 *   status: ReservationStatus,
 *   reservationDateTime: string,
 *   collectionDeadline: string | null,
 *   customerName: string,
 *   customerEmail: string,
 *   customerPhone: string | null,
 *   notes: string | null,
 *   adminNotes: string | null,
 *   performance: {
 *     id: string,
 *     performanceDateTime: string,
 *     show: {
 *       title: string,
 *       slug: string
 *     },
 *     venue: {
 *       name: string
 *     }
 *   },
 *   reservedTickets: ReservedTicket[]
 * }
 *
 * Process:
 * 1. Authenticates FOH staff member
 * 2. Validates query parameters
 * 3. Constructs database query with filters
 * 4. Fetches reservations with related data
 * 5. Calculates status counts for filtering UI
 * 6. Returns paginated reservation list
 *
 * Error Responses:
 * - 400: Invalid query parameters
 * - 401: Authentication required
 * - 403: Insufficient permissions (FOH access required)
 * - 500: Internal server error
 */
import prisma from '~~/server/database'
import { reservationWithRelationsSelectQuery } from '~~/server/utils/database/reservation'

export default defineEventHandler(async (event) => {
  try {
    // FOH access requires ADMIN or MANAGER role
    await requireFOHAccess(event)

    const query = getQuery(event)

    // Validate pagination and sorting
    const { page, limit, skip } = validatePagination(query)
    const { sortBy, sortOrder } = validateSort(query, [
      'createdAt', 'customerName', 'status', 'totalPrice',
    ])

    // Filter parameters
    const status = query.status as string
    const performanceId = query.performance_id ? Number(query.performance_id) : undefined
    const search = query.search as string
    const today = query.today === 'true'
    const upcoming = query.upcoming === 'true'

    // Build where clause
    const where = {} as Record<string, unknown>

    if (status) {
      where.status = status
    }

    if (performanceId) {
      where.performanceId = performanceId
    }

    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { reservationCode: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (today) {
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date()
      endOfDay.setHours(23, 59, 59, 999)

      where.performance = {
        startDateTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      }
    }
    else if (upcoming) {
      where.performance = {
        startDateTime: {
          gte: new Date(),
        },
      }
    }

    // Handle sort mapping
    let orderBy = {} as Record<string, string>
    if (sortBy === 'customerName') {
      orderBy = { customerName: sortOrder }
    }
    else if (sortBy === 'totalPrice') {
      orderBy = { totalPrice: sortOrder }
    }
    else {
      orderBy = { createdAt: sortOrder }
    }

    const [reservations, total] = await Promise.all([
      prisma.reservation.findMany({
        where,
        select: reservationWithRelationsSelectQuery,
        orderBy,
        skip,
        take: limit,
      }),
      prisma.reservation.count({ where }),
    ])

    return paginatedResponse(
      reservations,
      { page, total, limit },
    )
  }
  catch (error) {
    return handleApiError(error)
  }
})
