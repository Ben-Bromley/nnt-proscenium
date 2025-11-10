// Get a customer's reservation history & details
export default defineEventHandler(async (event) => {
  // FOH access requires ADMIN or MANAGER role
  await requireFOHAccess(event)

  return 'Hello Nitro'
})
