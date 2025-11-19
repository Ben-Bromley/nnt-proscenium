<template>
  <UContainer class="flex flex-col items-center justify-center gap-4 p-4">
    <UPageCard
      class="w-full max-w-md"
      highlight
      highlight-color="secondary"
    >
      <!-- Request Reset Form (no token) -->
      <UAuthForm
        v-if="!token && !requestSuccess"
        :schema="forgotSchema"
        :fields="forgotFields"
        title="Reset Password"
        icon="i-lucide-key-round"
        @submit="onForgotSubmit"
      >
        <template #description>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </template>

        <template #validation>
          <UAlert
            v-if="errorMessage"
            color="error"
            icon="i-lucide-alert-circle"
            :title="errorMessage"
          />
        </template>

        <template #footer>
          Remember your password?
          <ULink
            to="/login"
            class="text-primary font-medium"
          >
            Sign in
          </ULink>
        </template>
      </UAuthForm>

      <!-- Success Message (after request) -->
      <div
        v-if="!token && requestSuccess"
        class="text-center p-6"
      >
        <UIcon
          name="i-lucide-mail-check"
          class="w-16 h-16 mx-auto text-primary mb-4"
        />
        <h2 class="text-2xl font-bold mb-2">
          Check Your Email
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          If an account exists with that email address, we've sent you a password reset link.
          Please check your inbox and follow the instructions.
        </p>
        <UButton
          to="/login"
          color="primary"
          size="lg"
          block
        >
          Return to Login
        </UButton>
      </div>

      <!-- Reset Password Form (with token) -->
      <UAuthForm
        v-if="token && !resetSuccess"
        :schema="resetSchema"
        :fields="resetFields"
        title="Set New Password"
        icon="i-lucide-lock"
        @submit="onResetSubmit"
      >
        <template #description>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Enter your new password below. Make sure it's secure and memorable.
          </p>
        </template>

        <template #validation>
          <UAlert
            v-if="errorMessage"
            color="error"
            icon="i-lucide-alert-circle"
            :title="errorMessage"
          />
        </template>

        <template #footer>
          <ULink
            to="/login"
            class="text-primary font-medium"
          >
            Back to login
          </ULink>
        </template>
      </UAuthForm>

      <!-- Success Message (after reset) -->
      <div
        v-if="token && resetSuccess"
        class="text-center p-6"
      >
        <UIcon
          name="i-lucide-check-circle"
          class="w-16 h-16 mx-auto text-green-500 mb-4"
        />
        <h2 class="text-2xl font-bold mb-2">
          Password Reset Successful
        </h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">
          Your password has been successfully reset. You can now sign in with your new password.
        </p>
        <UButton
          to="/login"
          color="primary"
          size="lg"
          block
        >
          Continue to Login
        </UButton>
      </div>
    </UPageCard>
  </UContainer>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  middleware: 'guest',
  title: 'Reset Password',
  description: 'Reset your account password',
})

const route = useRoute()
const token = computed(() => route.query.token as string | undefined)

const errorMessage = useState('password-reset-error-message', () => '')
const requestSuccess = ref(false)
const resetSuccess = ref(false)

// Forgot Password Schema
const forgotSchema = z.object({
  email: z.email('Please enter a valid email address'),
})

type ForgotSchema = z.output<typeof forgotSchema>

const forgotFields: AuthFormField[] = [
  {
    name: 'email',
    type: 'text' as const,
    label: 'Email',
    placeholder: 'Enter your email address',
    required: true,
    autocomplete: 'email',
  },
]

// Reset Password Schema
const resetSchema = z.object({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/\d/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type ResetSchema = z.output<typeof resetSchema>

const resetFields: AuthFormField[] = [
  {
    name: 'password',
    type: 'password' as const,
    label: 'New Password',
    placeholder: 'Enter your new password',
    required: true,
    autocomplete: 'new-password',
  },
  {
    name: 'confirmPassword',
    type: 'password' as const,
    label: 'Confirm Password',
    placeholder: 'Confirm your new password',
    required: true,
    autocomplete: 'new-password',
  },
]

// Handle forgot password submission
async function onForgotSubmit(event: FormSubmitEvent<ForgotSchema>) {
  errorMessage.value = ''

  try {
    await $fetch('/api/v2/auth/password/forgot', {
      method: 'POST',
      body: { email: event.data.email },
    })
    requestSuccess.value = true
  }
  catch (error) {
    handleApiError(error, errorMessage)
  }
}

// Handle password reset submission
async function onResetSubmit(event: FormSubmitEvent<ResetSchema>) {
  errorMessage.value = ''

  if (!token.value) {
    errorMessage.value = 'Invalid reset token'
    return
  }

  try {
    await $fetch('/api/v2/auth/password/reset', {
      method: 'POST',
      body: {
        token: token.value,
        password: event.data.password,
      },
    })
    resetSuccess.value = true
  }
  catch (error) {
    handleApiError(error, errorMessage)
  }
}
</script>
