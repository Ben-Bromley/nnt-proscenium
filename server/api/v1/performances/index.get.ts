/**
 * GET /api/v1/performances
 *
 * Retrieves a list of upcoming published performances with optional filtering and pagination.
 *
 * Query Parameters:
 * @param {string} [venueId] - Filter by venue ID
 * @param {string} [showId] - Filter by show ID
 * @param {string} [from] - Filter performances from this date (ISO string)
 * @param {string} [to] - Filter performances up to this date (ISO string)
 * @param {number} [limit=10] - Number of performances to return (max 50)
 * @param {number} [offset=0] - Number of performances to skip for pagination
 * @param {boolean} [includeAvailability=false] - Include ticket availability information
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
 *   show: {
 *     id: string,
 *     title: string,
 *     slug: string,
 *     posterImageUrl: string | null,
 *     ageRating: string | null
 *   },
 *   venue: {
 *     id: string,
 *     name: string,
 *     capacity: number
 *   },
 *   availability?: {
 *     totalCapacity: number,
 *     availableTickets: number,
 *     reservedCount: number
 *   }
 * }
 *
 * Process:
 * 1. Validates query parameters
 * 2. Constructs database query with filters
 * 3. Fetches performances with show and venue relations
 * 4. Calculates availability if requested
 * 5. Returns paginated results
 *
 * Error Responses:
 * - 400: Invalid query parameters
 * - 500: Internal server error
 */
import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const query = getQuery(event)

    // Parse and validate query parameters
    const { page, limit, skip } = validatePagination(query)
    const search = query.search as string || ''
    const venueId = query.venueId as string || ''
    const upcomingOnly = query.upcomingOnly !== 'false'
    const availableOnly = query.availableOnly === 'true'

    // Validate and set sorting
    const allowedSortFields = ['startDateTime', 'createdAt', 'title']
    const { sortBy, sortOrder } = validateSort(query, allowedSortFields)

    // Build where clause
    const where: Record<string, unknown> = {
      show: {
        status: 'PUBLISHED', // Only show performances for published shows
      },
    }

    // Venue filter
    if (venueId) {
      where.venueId = venueId
    }

    // Upcoming only filter
    if (upcomingOnly) {
      where.startDateTime = { gte: new Date() }
    }

    // Available for reservations filter
    if (availableOnly) {
      where.reservationsOpen = true
      where.status = 'SCHEDULED'
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
              description: true,
              posterImageUrl: true,
              ageRating: true,
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

    return paginatedResponse(
      performances,
      { page, total, limit },
    )
  }
  catch (error) {
    return handleApiError(error)
  }
})
