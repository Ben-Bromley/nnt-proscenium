// Update a ticket type by ID
import { updateTicketType } from '~~/server/utils/database/ticket'

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

    const body = await readBody(event)

    // Validate request body using Zod schema
    const validatedData = ticketTypeUpdateSchema.parse(body)

    // Use database helper to update ticket type
    const updatedTicketType = await updateTicketType(ticketTypeId, validatedData)

    return successResponse(
      updatedTicketType,
      `Ticket type "${updatedTicketType.name}" updated successfully`,
    )
  }
  catch (error) {
    return handleApiError(error)
  }
})
