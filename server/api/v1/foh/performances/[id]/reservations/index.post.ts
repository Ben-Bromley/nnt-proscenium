// Create a new reservation (defaults to PURCHASED_ON_DOOR)
export default defineEventHandler(async (event) => {
  // FOH access requires ADMIN or MANAGER role
  await requireFOHAccess(event)

  return 'Hello Nitro'
})
