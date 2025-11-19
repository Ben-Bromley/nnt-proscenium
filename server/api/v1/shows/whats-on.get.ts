/**
 * GET /api/shows/whats-on
 *
 * Retrieves a list of currently running shows with upcoming performances.
 *
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     shows: Show[],
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
 * Error Responses:
 * - 500: Internal server error
 */
import prisma from '~~/server/database'

export default defineEventHandler(async () => {
  try {
    const now = new Date()

    // Execute queries
    const [shows] = await Promise.all([
      prisma.show.findMany({
        where: {
          status: 'PUBLISHED',
          performances: {
            some: {
              startDateTime: { gte: now },
            },
          },
        },
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
              startDateTime: { gte: now },
            },
            select: {
              id: true,
              title: true,
              startDateTime: true,
              runtimeMinutes: true,
              intervalMinutes: true,
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
    ])

    const whatsOnShows = shows.sort((a, b) => {
      const aNextPerformance = a.performances
        .map(p => new Date(p.startDateTime))
        .sort((d1, d2) => d1.getTime() - d2.getTime())[0]
      const bNextPerformance = b.performances
        .map(p => new Date(p.startDateTime))
        .sort((d1, d2) => d1.getTime() - d2.getTime())[0]

      return aNextPerformance!.getTime() - bNextPerformance!.getTime()
    }).slice(0, 3) || []

    return successResponse(whatsOnShows)
  }
  catch (error) {
    return handleApiError(error)
  }
})
