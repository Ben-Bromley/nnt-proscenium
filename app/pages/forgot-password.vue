<template>
  <UContainer class="flex flex-col items-center justify-center min-h-[calc(100vh-(var(--ui-header-height)*2))] gap-4 p-4">
    <UPageCard
      class="w-full max-w-md"
      highlight
      highlight-color="secondary"
    >
      <UAuthForm
        ref="forgotPasswordForm"
        :schema="schema"
        :fields="forgotPasswordFields"
        title="Reset Password"
        icon="i-lucide-key"
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
            title="Reset link sent!"
            description="Please check your inbox for password reset instructions."
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
  title: 'Forgot Password',
  description: 'Reset your password',
})

const toast = useToast()

// Form state
const pending = ref(false)
const error = ref<H3Error | null>(null)
const success = ref(false)

// Expose form state to template
const forgotPasswordForm = useTemplateRef('forgotPasswordForm')

// Forgot password form schema
const schema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

type Schema = z.output<typeof schema>

// Define form fields
const forgotPasswordFields = [
  {
    name: 'email',
    type: 'email' as const,
    label: 'Email',
    placeholder: 'Enter your email address',
    required: true,
    autocomplete: 'email',
  },
]

// Handle form submission
async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    pending.value = true
    error.value = null
    success.value = false

    // Call forgot password API endpoint
    await $fetch('/api/v1/auth/password/reset', {
      method: 'POST',
      body: { email: event.data.email },
    })

    // Success state
    success.value = true

    // Success toast
    toast.add({
      title: 'Reset link sent!',
      description: 'Please check your email for password reset instructions.',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })
  }
  catch (err) {
    console.error('Forgot password error:', err)

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
    case 404:
      return 'Email not found'
    case 429:
      return 'Too many requests'
    case 500:
      return 'Server error'
    default:
      return 'Request failed'
  }
}

function getErrorMessage(error: H3Error): string {
  switch (error.statusCode) {
    case 400:
      return 'Please enter a valid email address.'
    case 404:
      return 'No account found with this email address.'
    case 429:
      return 'Too many password reset requests. Please try again later.'
    case 500:
      return 'Something went wrong on our end. Please try again.'
    default:
      return 'An unexpected error occurred. Please try again.'
  }
}
</script>
