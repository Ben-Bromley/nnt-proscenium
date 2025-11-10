// Calculate pricing information for an on the door ticket
export default defineEventHandler(async (event) => {
  // FOH access requires ADMIN or MANAGER role
  await requireFOHAccess(event)

  return 'Hello Nitro'
})
