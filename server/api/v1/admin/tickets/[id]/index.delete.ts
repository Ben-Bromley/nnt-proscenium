// Delete a ticket type by ID
import { deleteTicketTypeById, getTicketTypeById } from '~~/server/utils/database/ticket'

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

    // Get ticket type name for response message (this also validates existence)
    const ticketType = await getTicketTypeById(ticketTypeId)

    // Use database helper to delete ticket type
    await deleteTicketTypeById(ticketTypeId)

    return successResponse(
      null,
      `Ticket type "${ticketType.name}" deleted successfully`,
    )
  }
  catch (error) {
    return handleApiError(error)
  }
})
