// Get reservations for a specific performance
export default defineEventHandler(async (event) => {
  // FOH access requires ADMIN or MANAGER role
  await requireFOHAccess(event)

  return 'Hello Nitro'
})
