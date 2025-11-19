import z from 'zod'
import prisma from '~~/server/database'

const bodySchema = z.object({
  email: z.email(),
})

// POST /api/v2/auth/password/forgot
//
// Initiate the password reset process for a user.
export default defineEventHandler(async (event) => {
  const { email } = await readValidatedBody(event, bodySchema.parse)

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    // To prevent user enumeration, respond with a success message even if the user doesn't exist
    return {}
  }

  const resetToken = generateVerificationToken()
  const resetExpires = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hour

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: resetToken,
      passwordResetExpires: resetExpires,
    },
  })

  await sendPasswordResetEmail(user.email, resetToken)

  return {}
})
