import z from 'zod'
import prisma from '~~/server/database'
import { createEmailVerificationToken, sendVerificationEmail } from '~~/server/utils/auth'

const bodySchema = z.object({
  email: z.email(),
  password: z.string().min(8, 'Password must be at least 8 characters long')
    .refine(val => /[a-z]/.test(val), { message: 'Password must contain at least one lowercase letter' })
    .refine(val => /[A-Z]/.test(val), { message: 'Password must contain at least one uppercase letter' })
    .refine(val => /\d/.test(val), { message: 'Password must contain at least one number' }),
  name: z.string().min(1, 'Name is required'),
})

// POST /api/v2/auth/register
//
// Register a new user.
export default defineEventHandler(async (event) => {
  const { email, password, name } = await readValidatedBody(event, bodySchema.parse)

  // Check if user already exists
  const userExists = await prisma.user.findUnique({
    where: { email },
  })

  if (userExists) {
    throw createError({
      statusCode: 409,
      statusMessage: 'User with this email already exists',
    })
  }

  // Hash password
  const passwordHash = await hashPassword(password)

  const user = await prisma.user.create({
    data: {
      email,
      password: passwordHash,
      emailVerified: false,
      setupCompleted: false,
      profile: {
        create: {
          name,
          avatar: null,
        },
      },
      membership: {
        create: {
          type: 'UNKNOWN',
          expiry: null,
        },
      },
    },
    include: {
      profile: true,
      roles: true,
    },
  })

  // Generate and send email verification token
  const verificationToken = await createEmailVerificationToken(user.id)
  await sendVerificationEmail(email, verificationToken)

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
