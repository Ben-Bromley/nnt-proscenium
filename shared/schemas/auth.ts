import { z } from 'zod'
import { emailSchema, nameSchema, passwordSchema, required } from './common'

const confirmPasswordCheck = (data: { password?: string, newPassword?: string, confirmPassword: string }) => {
  if (data.password && data.password !== data.confirmPassword) {
    throw new z.ZodError([{ code: 'custom', message: 'Passwords must match', path: ['confirmPassword'] }])
  }
  else if (data.newPassword && data.newPassword !== data.confirmPassword) {
    throw new z.ZodError([{ code: 'custom', message: 'Passwords must match', path: ['confirmPassword'] }])
  }

  return data
}

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
})

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
})

export const registerFormSchema = registerSchema.extend({
  confirmPassword: passwordSchema,
}).refine(confirmPasswordCheck)

export const passwordResetSchema = z.object({
  newPassword: passwordSchema,
  confirmPassword: passwordSchema,
}).refine(confirmPasswordCheck)

export const passwordResetInitiateSchema = z.object({
  email: emailSchema,
})

export const passwordResetCompleteSchema = z.object({
  token: required('Reset token'),
  newPassword: passwordSchema,
})

export const passwordUpdateSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
  confirmPassword: passwordSchema,
}).refine(confirmPasswordCheck)

export const emailVerificationSchema = z.object({
  token: required('Verification token'),
})

/**
 * Form schemas that match frontend form structures
 */

export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

export const forgotPasswordFormSchema = z.object({
  email: emailSchema,
})

export const resetPasswordFormSchema = z.object({
  token: required('Reset token'),
  newPassword: passwordSchema,
  confirmPassword: passwordSchema,
}).refine(confirmPasswordCheck)

export const passwordUpdateFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: passwordSchema,
}).refine(confirmPasswordCheck)
