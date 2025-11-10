// Get a ticket type by ID
import { getTicketTypeByIdWithDetails } from '~~/server/utils/database/ticket'

export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'ADMIN')

    const ticketTypeId = getRouterParam(event, 'id')

    if (!ticketTypeId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Ticket type ID is required',
      })
    }

    const ticketType = await getTicketTypeByIdWithDetails(ticketTypeId)

    return successResponse(ticketType)
  }
  catch (error) {
    return handleApiError(error)
  }
})
