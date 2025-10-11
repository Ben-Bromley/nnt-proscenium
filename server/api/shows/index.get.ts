/**
 * GET /api/shows
 *
 * Retrieves a list of published (active) shows with optional filtering and pagination.
 *
 * Query Parameters:
 * @param {string} [search] - Search term to filter shows by title or description
 * @param {ShowType} [type] - Filter by show type (IN_HOUSE, STUDIO, FESTIVAL, EXTERNAL_HIRE, WORKSHOP, OTHER)
 * @param {number} [limit=10] - Number of shows to return (max 50)
 * @param {number} [offset=0] - Number of shows to skip for pagination
 * @param {boolean} [includeUpcoming=true] - Include shows with upcoming performances
 * @param {boolean} [includePast=false] - Include shows with only past performances
 *
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     shows: Show[],
 *     total: number,
 *     limit: number,
 *     offset: number
 *   }
 * }
 *
 * Show Object:
 * {
 *   id: string,
 *   title: string,
 *   slug: string,
 *   description: string,
 *   status: ShowStatus,
 *   showType: ShowType,
 *   posterImageUrl: string | null,
 *   programUrl: string | null,
 *   ageRating: string | null,
 *   createdAt: string,
 *   updatedAt: string,
 *   contentWarnings: ContentWarning[],
 *   performances: Performance[] // Only upcoming performances
 * }
 *
 * Process:
 * 1. Validates query parameters
 * 2. Constructs database query with filters
 * 3. Fetches published shows with relations
 * 4. Returns paginated results
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
    const showType = query.showType as string || ''
    const includeUpcoming = query.includeUpcoming !== 'false'
    const includePast = query.includePast === 'true'

    // Validate and set sorting
    const allowedSortFields = ['createdAt', 'updatedAt', 'title']
    const { sortBy, sortOrder } = validateSort(query, allowedSortFields)

    // Build where clause
    const where: Record<string, unknown> = {
      status: 'PUBLISHED', // Only show published shows to public
    }

    // Show type filter
    if (showType) {
      where.showType = showType
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    // Performance date filtering
    const now = new Date()
    if (includeUpcoming && !includePast) {
      // Only upcoming shows
      where.performances = {
        some: {
          startDateTime: { gte: now },
        },
      }
    }
    else if (!includeUpcoming && includePast) {
      // Only past shows
      where.performances = {
        some: {
          startDateTime: { lt: now },
        },
      }
    }
    else if (!includeUpcoming && !includePast) {
      // This would return no shows, but let's handle it gracefully
      where.performances = {
        some: {
          startDateTime: { gte: new Date('9999-12-31') }, // Impossible date
        },
      }
    }
    // If both includeUpcoming and includePast are true, no additional filter

    // Build orderBy clause
    const orderBy: Record<string, string> = {}
    orderBy[sortBy] = sortOrder

    // Execute queries
    const [shows, total] = await Promise.all([
      prisma.show.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          showType: true,
          posterImageUrl: true,
          ageRating: true,
          createdAt: true,
          updatedAt: true,
          performances: {
            where: {
              startDateTime: includeUpcoming ? { gte: now } : undefined,
            },
            select: {
              id: true,
              title: true,
              startDateTime: true,
              endDateTime: true,
              venue: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: {
              startDateTime: 'asc',
            },
          },
          contentWarnings: {
            select: {
              notes: true,
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
        },
      }),
      prisma.show.count({ where }),
    ])

    return paginatedResponse(
      shows,
      { page, total, limit },
    )
  }
  catch (error) {
    return handleApiError(error)
  }
})
