import z from 'zod'
import prisma from '~~/server/database'
import { createEmailVerificationToken, sendVerificationEmail } from '~~/server/utils/auth'

const bodySchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
})

// POST /api/v2/auth/email/verify
//
// Verify a user's email address using a token.
export default defineEventHandler(async (event) => {
  const { token } = await readValidatedBody(event, bodySchema.parse)

  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
    },
    include: {
      profile: true,
      roles: true,
    },
  })

  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid or expired verification token',
    })
  }

  if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
    // Token has expired - Generate and send new email verification token
    const verificationToken = await createEmailVerificationToken(user.id)
    await sendVerificationEmail(user.email, verificationToken)

    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid or expired verification token',
    })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpires: null,
    },
  })

  await replaceUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
      emailVerified: true,
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
