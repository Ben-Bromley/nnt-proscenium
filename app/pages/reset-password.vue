<template>
  <UContainer class="flex flex-col items-center justify-center min-h-[calc(100vh-(var(--ui-header-height)*2))] gap-4 p-4">
    <UPageCard
      class="w-full max-w-md"
      highlight
      highlight-color="secondary"
    >
      <UAuthForm
        ref="resetPasswordForm"
        :schema="schema"
        :fields="resetPasswordFields"
        title="Reset Password"
        icon="i-lucide-lock"
        :loading="pending"
        :disabled="pending"
        @submit="onSubmit"
      >
        <template #validation>
          <!-- Success alert -->
          <UAlert
            v-if="success"
            color="success"
            icon="i-lucide-check-circle"
            title="Password reset successfully!"
            description="Your password has been updated. You can now sign in with your new password."
            class="mb-4"
          />

          <!-- General error alert -->
          <UAlert
            v-else-if="error"
            color="error"
            icon="i-lucide-alert-circle"
            :title="getErrorTitle(error.statusCode)"
            :description="getErrorMessage(error)"
            class="mb-4"
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
    </UPageCard>
  </UContainer>
</template>

<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { H3Error } from 'h3'

// Define the page metadata
definePageMeta({
  middleware: 'guest',
  title: 'Reset Password',
  description: 'Set your new password',
})

const toast = useToast()
const route = useRoute()

// Form state
const pending = ref(false)
const error = ref<H3Error | null>(null)
const success = ref(false)

// Extract token from URL
const token = computed(() => route.query.token as string)

// Redirect if no token
onMounted(() => {
  if (!token.value) {
    toast.add({
      title: 'Invalid reset link',
      description: 'The password reset link is invalid or expired.',
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
    navigateTo('/forgot-password')
  }
})

// Expose form state to template
const resetPasswordForm = useTemplateRef('resetPasswordForm')

// Reset password form schema
const schema = z.object({
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  confirmPassword: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords don\'t match',
  path: ['confirmPassword'],
})

type Schema = z.output<typeof schema>

// Define form fields
const resetPasswordFields = [
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
    label: 'Confirm New Password',
    placeholder: 'Confirm your new password',
    required: true,
    autocomplete: 'new-password',
  },
]

// Handle form submission
async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    pending.value = true
    error.value = null
    success.value = false

    // Get the token from the URL query parameter
    if (!token.value) {
      throw new Error('Reset token is missing')
    }

    // Call reset password API endpoint
    await $fetch('/api/v1/auth/password/reset', {
      method: 'POST',
      body: {
        token: token.value,
        newPassword: event.data.password,
      },
    })

    // Success state
    success.value = true

    // Success toast
    toast.add({
      title: 'Password reset!',
      description: 'Your password has been updated successfully.',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })

    // Redirect to login after a short delay
    setTimeout(() => {
      navigateTo('/login')
    }, 3000)
  }
  catch (err) {
    console.error('Reset password error:', err)

    // Set error for display in template
    if (err && typeof err === 'object' && 'statusCode' in err) {
      error.value = err as H3Error
    }
    else {
      error.value = { statusCode: 500, message: 'An unexpected error occurred' } as H3Error
    }
  }
  finally {
    pending.value = false
  }
}

// Error message helpers
function getErrorTitle(statusCode?: number): string {
  switch (statusCode) {
    case 400:
      return 'Invalid input'
    case 401:
      return 'Invalid or expired token'
    case 404:
      return 'Reset token not found'
    case 422:
      return 'Validation error'
    case 500:
      return 'Server error'
    default:
      return 'Reset failed'
  }
}

function getErrorMessage(error: H3Error): string {
  switch (error.statusCode) {
    case 400:
      return 'Please check your input and try again.'
    case 401:
      return 'Your reset link is invalid or has expired. Please request a new one.'
    case 404:
      return 'Reset token not found. Please request a new password reset.'
    case 422:
      return 'Please check your password and try again.'
    case 500:
      return 'Something went wrong on our end. Please try again.'
    default:
      return 'An unexpected error occurred. Please try again.'
  }
}
</script>
