// POST /api/v2/auth/logout
//
// Logs out the current user by clearing their session.
export default defineEventHandler(async (event) => {
  await clearUserSession(event)

  return {}
})
