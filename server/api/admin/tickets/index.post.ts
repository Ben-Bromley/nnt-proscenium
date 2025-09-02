import { createTicketType } from '~~/server/utils/database/ticket'

/**
 * POST /api/admin/tickets
 *
 * Creates a new ticket type for use across shows and performances.
 * Requires admin authentication.
 *
 * Request Body:
 * @param {string} name - Ticket type name (e.g., "Student", "Member", "Standard")
 * @param {string} [description] - Detailed description of the ticket type
 * @param {number} defaultPrice - Default price in currency units (e.g., pence)
 * @param {number} [sortOrder] - Display order for this ticket type
 * @param {boolean} [isActive=true] - Whether this ticket type is active
 *
 * Response:
 * {
 *   success: boolean,
 *   data: TicketType,
 *   message: string
 * }
 *
 * Validation:
 * - Name must be unique and between 1-50 characters
 * - Description must be less than 500 characters if provided
 * - Default price must be a positive number
 *
 * Process:
 * 1. Authenticates admin user
 * 2. Validates input data using Zod schema
 * 3. Uses database helper to create ticket type (handles uniqueness checks)
 * 4. Returns created ticket type
 *
 * Error Responses:
 * - 400: Invalid input data
 * - 401: Authentication required
 * - 403: Insufficient permissions (admin access required)
 * - 409: Ticket type name already exists
 * - 500: Internal server error
 */
export default defineEventHandler(async (event) => {
  try {
    await requireRole(event, 'ADMIN')

    const body = await readBody(event)

    // Validate request body using Zod schema
    const validatedData = ticketTypeCreateSchema.parse(body)

    // Use database helper to create ticket type
    const ticketType = await createTicketType(validatedData)

    return successResponse(
      ticketType,
      `Ticket type "${ticketType.name}" created successfully`,
    )
  }
  catch (error) {
    return handleApiError(error)
  }
})
