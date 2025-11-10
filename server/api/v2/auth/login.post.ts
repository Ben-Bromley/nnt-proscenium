import { z } from 'zod'
import prisma from '~~/server/database'

const bodySchema = z.object({
  email: z.email(),
  password: z.string().min(1, 'Password is required'),
})

// POST /api/v2/auth/login
//
// Authenticate a user and create a session.
export default defineEventHandler(async (event) => {
  const { email, password } = await readValidatedBody(event, bodySchema.parse)

  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      profile: true,
      roles: true,
    },
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid email or password',
    })
  }

  const isValidPassword = await verifyPassword(user.password, password)

  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid email or password',
    })
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      setupCompleted: user.setupCompleted,
      roles: user.roles.map(r => r.role),
      profile: {
        name: user.profile?.name,
        avatar: user.profile?.avatar,
      },
    },
    loggedInAt: new Date(),
  })

  return {}
})
