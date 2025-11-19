import prisma from '~~/server/database'

// GET /api/v2/users
//
// Retrieve a list of users. (admin only)
export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      emailVerified: true,
      roles: {
        select: {
          role: true,
        },
      },
      createdAt: true,
      updatedAt: true,
      profile: {
        select: {
          name: true,
          avatar: true,
        },
      },
      membership: {
        select: {
          type: true,
        },
      },
    },
  })

  const mappedUsers = users.map(user => ({
    ...user,
    roles: user.roles.map(r => r.role),
  }))

  return mappedUsers
})
