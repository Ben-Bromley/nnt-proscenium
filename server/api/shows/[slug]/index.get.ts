/**
 * GET /api/shows/[slug]
 *
 * Retrieves detailed information for a specific show by its slug identifier.
 *
 * Route Parameters:
 * @param {string} slug - URL-friendly show identifier
 *
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     show: {
 *       id: string,
 *       title: string,
 *       slug: string,
 *       description: string,
 *       status: ShowStatus,
 *       showType: ShowType,
 *       posterImageUrl: string | null,
 *       programmeUrl: string | null,
 *       ageRating: string | null,
 *       createdAt: string,
 *       updatedAt: string,
 *       contentWarnings: ContentWarning[],
 *       performances: Performance[],
 *       induction: ShowInduction | null,
 *       showTicketPrices: ShowTicketPrice[]
 *     }
 *   }
 * }
 *
 * Process:
 * 1. Extracts slug from route parameters
 * 2. Validates slug format
 * 3. Fetches show with all relations from database
 * 4. Returns complete show data
 *
 * Error Responses:
 * - 400: Invalid slug format
 * - 404: Show not found or not published
 * - 500: Internal server error
 */
import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    const slug = getRouterParam(event, 'slug')

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Show slug is required',
      })
    }

    const show = await prisma.show.findUnique({
      where: {
        slug,
        status: 'PUBLISHED', // Only show published shows to public
      },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        showType: true,
        posterImageUrl: true,
        programmeUrl: true,
        ageRating: true,
        createdAt: true,
        updatedAt: true,
        performances: {
          where: {
            startDateTime: { gte: new Date() }, // Only upcoming performances
          },
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
            venue: {
              select: {
                id: true,
                name: true,
                address: true,
                capacity: true,
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
        showTicketPrices: {
          select: {
            id: true,
            price: true,
            ticketType: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
          orderBy: {
            price: 'asc',
          },
        },
      },
    })

    if (!show) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Show not found',
      })
    }

    return successResponse(show)
  }
  catch (error) {
    return handleApiError(error)
  }
})
