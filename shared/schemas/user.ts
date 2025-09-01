import { z } from 'zod'
import { MembershipType, RoleType } from '@prisma/client'
import { nameSchema, emailSchema, passwordSchema } from './common'

export const studentIdSchema = z.string().max(20, 'Student ID too long').optional()

const currentYear = new Date().getFullYear()

const socialLinksSchema = z.object({
  facebook: z.string().url('Invalid Facebook URL').max(100, 'Facebook URL too long').optional(),
  instagram: z.string()
    .regex(/^@?[\w.]{1,30}$/, 'Invalid Instagram handle')
    .max(30, 'Instagram handle too long')
    .optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').max(100, 'LinkedIn URL too long').optional(),
  github: z.string().url('Invalid GitHub URL').max(100, 'GitHub URL too long').optional(),
  discord: z.string()
    .regex(/(^.{3,32}#[0-9]{4}$)|(^(?:[a-z0-9_]|\.[a-z0-9_]){2,32}$)/, 'Invalid Discord username') // Support the old username#tag format too even though discord no longer supports it
    .optional(),
})

const profileSchema = z.object({
  name: nameSchema,
  bio: z.string().max(500, 'Bio too long').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
  gradYear: z.union([z.number().int(), z.string()]).optional(), // TODO: only accept numbers. It only accepts strings here because I haven't updated all usage
  course: z.string().max(100, 'Course name too long').optional(),
  socialLinks: socialLinksSchema.optional(),
})

// Function to validate graduation year and alumni membership rules
function validateGradYear(data: { profile?: { gradYear?: string | number }, membership?: { type?: MembershipType } }): boolean {
  const gradYear = data.profile?.gradYear

  if (gradYear !== undefined && gradYear !== '') {
    // Parse gradYear to number if it's a string
    // TODO: update usage so that gradYear is always a number
    const year = typeof gradYear === 'string' ? parseInt(gradYear, 10) : gradYear

    // Check for valid year range
    if (isNaN(year) || year < 1900 || year > currentYear + 5) throw new z.ZodError([{
      code: 'invalid_date',
      message: 'Invalid graduation year',
      path: ['profile', 'gradYear'],
    }])

    // Alumni must have graduation year in the past
    if (data.membership?.type === 'ALUMNI' && year > currentYear) throw new z.ZodError([{
      code: 'invalid_date',
      message: 'Alumni must have a graduation year in the past',
      path: ['profile', 'gradYear'],
    }])
  }

  return true
}

export const userUpdateSchema = z.object({
  email: emailSchema.optional(),
  profile: profileSchema.optional(),
  membership: z.object({
    type: z.nativeEnum(MembershipType),
    expiry: z.date().optional(),
  }).optional(),
  studentId: studentIdSchema,
}).refine(validateGradYear)

export const adminUserUpdateSchema = userUpdateSchema.and(
  z.object({
    roles: z.array(z.nativeEnum(RoleType)).optional(),
    newPassword: passwordSchema.optional(),
    emailVerified: z.boolean().optional(),
    setupCompleted: z.boolean().optional(),
    isActive: z.boolean().optional(),
  }),
)

/**
 * Form schemas that match frontend form structures
 */

const formSocialLinksSchema = z.object({
  facebook: z.string(),
  instagram: z.string(),
  linkedin: z.string(),
  github: z.string(),
  discord: z.string(),
})

const formProfileSchema = z.object({
  name: z.string(),
  bio: z.string(),
  avatar: z.string(),
  gradYear: z.string(), // String in form, converted to number in handler
  course: z.string(),
  socialLinks: formSocialLinksSchema,
})

export const userSetupFormSchema = z.object({
  email: emailSchema.optional(),
  profile: formProfileSchema.optional(),
  membership: z.object({
    type: z.nativeEnum(MembershipType),
    expiry: z.string().optional(), // String in form for date picker
  }).optional(),
  studentId: z.string(),
}).refine(validateGradYear)

export const userAccountFormSchema = z.object({
  email: emailSchema,
  profile: formProfileSchema,
  membership: z.object({
    type: z.nativeEnum(MembershipType),
    expiry: z.string().optional(), // String in form for date picker
  }),
  studentId: z.string(),
}).refine(validateGradYear)

export const adminUserEditFormSchema = z.object({
  email: emailSchema,
  studentId: z.string(),
  password: z.string(),
  emailVerified: z.boolean(),
  setupCompleted: z.boolean(),
  isActive: z.boolean(),
  roles: z.array(z.nativeEnum(RoleType)),
  membership: z.object({
    type: z.nativeEnum(MembershipType),
    expiry: z.string().optional(), // String in form for date picker
  }),
  profile: formProfileSchema,
}).refine(validateGradYear)
