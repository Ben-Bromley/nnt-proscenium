import z from 'zod'
import prisma from '~~/server/database'

const bodySchema = z.object({
  email: z.email('Valid email is required'),
})

// POST /api/v2/auth/email/request
//
// Request a new email verification token to be sent to the user's email.
export default defineEventHandler(async (event) => {
  const { email } = await readValidatedBody(event, bodySchema.parse)

  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    // To prevent user enumeration, respond with a success message even if the user doesn't exist
    return {}
  }

  // Check if already verified
  if (user.emailVerified) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Email is already verified',
    })
  }

  // Generate and send new verification token
  const verificationToken = await createEmailVerificationToken(user.id)
  await sendVerificationEmail(email, verificationToken)

  return {}
})
