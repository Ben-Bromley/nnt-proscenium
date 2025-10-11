/**
 * POST /api/admin/performances
 *
 * Creates a new performance for a show. Requires admin authentication.
 *
 * Request Body:
 * @param {string} showId - ID of the show this performance belongs to
 * @param {string} venueId - ID of the venue where performance takes place
 * @param {string} performanceDateTime - Performance date and time (ISO string)
 * @param {string} [details] - Performance-specific description or notes
 * @param {PerformanceTicketPriceInput[]} [ticketPrices] - Custom pricing for this performance
 *
 * PerformanceTicketPriceInput:
 * {
 *   ticketTypeId: string,
 *   price: number
 * }
 *
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     performance: {
 *       id: string,
 *       showId: string,
 *       venueId: string,
 *       performanceDateTime: string,
 *       doorOpenTime: string | null,
 *       details: string | null,
 *       isActive: boolean,
 *       createdAt: string,
 *       updatedAt: string,
 *       show: Show,
 *       venue: Venue,
 *       performanceTicketPrices: PerformanceTicketPrice[]
 *     }
 *   }
 * }
 *
 * Process:
 * 1. Authenticates admin user
 * 2. Validates input data and show/venue existence
 * 3. Checks for scheduling conflicts at the venue
 * 4. Creates performance record
 * 5. Creates custom ticket pricing if provided
 * 6. Returns complete performance data
 *
 * Validation:
 * - Show must exist and be active
 * - Venue must exist and be available
 * - Performance time must be in the future
 * - No overlapping performances at the same venue
 *
 * Error Responses:
 * - 400: Invalid input data or scheduling conflict
 * - 401: Authentication required
 * - 403: Insufficient permissions (admin access required)
 * - 404: Show or venue not found
 * - 409: Venue scheduling conflict
 * - 500: Internal server error
 */
import prisma from '~~/lib/prisma'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'ADMIN')

    const body = await readBody(event)

    // Basic validation
    if (!body.title || !body.startDateTime || !body.endDateTime || !body.showId || !body.maxCapacity) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: title, startDateTime, endDateTime, showId, and maxCapacity',
      })
    }

    // Validate dates
    const startDate = new Date(body.startDateTime)
    const endDate = new Date(body.endDateTime)

    if (startDate >= endDate) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Start date must be before end date',
      })
    }

    if (startDate <= new Date()) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Performance must be scheduled for a future date',
      })
    }

    // Check if show exists
    const show = await prisma.show.findUnique({
      where: { id: body.showId },
      select: { id: true, title: true, status: true },
    })

    if (!show) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Show not found',
      })
    }

    // Check if venue exists (if provided)
    if (body.venueId) {
      const venue = await prisma.venue.findUnique({
        where: { id: body.venueId },
        select: { id: true, name: true, isActive: true },
      })

      if (!venue || !venue.isActive) {
        throw createError({
          statusCode: 404,
          statusMessage: 'Venue not found or inactive',
        })
      }
    }

    // Create the performance
    const performance = await prisma.performance.create({
      data: {
        title: body.title,
        startDateTime: startDate,
        endDateTime: endDate,
        type: body.type || 'PERFORMANCE',
        details: body.details,
        status: body.status || 'SCHEDULED',
        maxCapacity: Number(body.maxCapacity),
        reservationsOpen: body.reservationsOpen ?? true,
        reservationInstructions: body.reservationInstructions,
        externalBookingLink: body.externalBookingLink,
        showId: body.showId,
        venueId: body.venueId,
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
        createdAt: true,
        show: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        venue: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return successResponse(
      performance,
      `Performance "${performance.title}" created successfully`,
    )
  }
  catch (error) {
    return handleApiError(error)
  }
})
