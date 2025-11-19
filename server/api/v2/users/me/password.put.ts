import z from 'zod'
import prisma from '~~/server/database'

const bodySchema = z.object({
  currentPassword: z.string(),
  newPassword: z.string().min(8, 'Password must be at least 8 characters long')
    .refine(val => /[a-z]/.test(val), { message: 'Password must contain at least one lowercase letter' })
    .refine(val => /[A-Z]/.test(val), { message: 'Password must contain at least one uppercase letter' })
    .refine(val => /\d/.test(val), { message: 'Password must contain at least one number' }),
})

// PUT /api/v2/users/me/password
//
// Update the authenticated user's password.
export default defineEventHandler(async (event) => {
  const sessionUser = await requireAuth(event)

  const { currentPassword, newPassword } = await readValidatedBody(event, bodySchema.parse)

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  // Verify current password
  const isValidPassword = await verifyPassword(user.password, currentPassword)

  if (!isValidPassword) {
    throw createError({
      statusCode: 401,
      message: 'Current password is incorrect',
    })
  }

  // Check that new password is different from current
  const isSamePassword = await verifyPassword(user.password, newPassword)

  if (isSamePassword) {
    throw createError({
      statusCode: 400,
      message: 'New password must be different from current password',
    })
  }

  const newPasswordHash = await hashPassword(newPassword)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: newPasswordHash,
      // Invalidate any existing password reset tokens
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  })

  // TODO: Send notification email about password change

  return {
    message: 'Password updated successfully',
  }
})
