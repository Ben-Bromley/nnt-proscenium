<template>
  <UContainer class="flex flex-col items-center justify-center min-h-[calc(100vh-(var(--ui-header-height)*2))] gap-4 p-4">
    <UPageCard
      class="w-full max-w-md"
      highlight
      highlight-color="secondary"
    >
      <UAuthForm
        ref="loginForm"
        :schema="schema"
        :fields="loginFields"
        title="Login"
        icon="icon:account"
        :loading="pending"
        :disabled="pending"
        @submit="onSubmit"
      >
        <template #password-hint>
          <ULink
            to="/forgot-password"
            class="text-primary font-medium"
            tabindex="-1"
          >
            Forgot password?
          </ULink>
        </template>

        <template #validation>
          <!-- Email verification alert -->
          <UAlert
            v-if="error?.statusCode === 403 && !resendSuccess"
            color="warning"
            icon="i-lucide-mail"
            title="Email verification required"
            class="mb-4"
          >
            <template #description>
              <div class="space-y-3">
                <div>
                  <p>Your email address has not been verified.</p>
                  <p>Please check your inbox for a verification link.</p>
                </div>
                <UButton
                  color="neutral"
                  variant="outline"
                  size="sm"
                  :loading="resendPending"
                  :disabled="resendPending"
                  block
                  @click="resendVerificationEmail"
                >
                  {{ resendPending ? 'Sending...' : 'Resend verification email' }}
                </UButton>
              </div>
            </template>
          </UAlert>

          <!-- Resend success alert -->
          <UAlert
            v-else-if="resendSuccess"
            color="success"
            icon="i-lucide-check-circle"
            title="Verification email sent!"
            description="Please check your inbox for a new verification link."
            class="mb-4"
          />

          <!-- General error alert -->
          <UAlert
            v-else-if="error && error.statusCode !== 403"
            color="error"
            icon="i-lucide-alert-circle"
            :title="getErrorTitle(error.statusCode)"
            :description="getErrorMessage(error)"
            class="mb-4"
          />
        </template>

        <template #footer>
          Don't have an account?
          <ULink
            to="/register"
            class="text-primary font-medium"
          >
            Sign up
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
  title: 'Login',
  description: 'Sign in to your account',
})

// Use the auth composable
const { login, pending, error } = useAuth()
const toast = useToast()

// Resend email state
const resendPending = ref(false)
const resendSuccess = ref(false)

// Expose form state to template
const loginForm = useTemplateRef('loginForm')

// Login form schema
const schema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters'),
  // remember: z.boolean().optional(),
})

type Schema = z.output<typeof schema>

// Define form fields
const loginFields = [
  {
    name: 'email',
    type: 'text' as const,
    label: 'Email',
    placeholder: 'Enter your email address',
    required: true,
    autocomplete: 'email',
  },
  {
    name: 'password',
    type: 'password' as const,
    label: 'Password',
    placeholder: 'Enter your password',
    required: true,
    autocomplete: 'current-password',
  },
  // {
  //   name: 'remember',
  //   type: 'checkbox' as const,
  //   label: 'Remember me',
  // },
]

// Handle form submission
async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    resendSuccess.value = false
    await login(event.data)

    // Success toast
    toast.add({
      title: 'Welcome back!',
      description: 'You have been successfully signed in.',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })

    // Redirect to intended page or dashboard
    await navigateTo('/')
  }
  catch (err) {
    // Error handling is managed by the auth composable
    // The error will be displayed in the validation template
    console.error('Login error:', err)
  }
}

// Resend verification email
async function resendVerificationEmail() {
  try {
    resendPending.value = true

    // Get the email from the form state
    const email = loginForm.value?.state.email || ''

    if (!email) {
      toast.add({
        title: 'Error',
        description: 'Please enter your email address first.',
        color: 'error',
      })
      return
    }

    // Call resend verification endpoint
    await $fetch('/api/auth/email/resend', {
      method: 'POST',
      body: { email },
    })

    resendSuccess.value = true

    toast.add({
      title: 'Email sent!',
      description: 'Please check your inbox for a new verification link.',
      color: 'success',
    })
  }
  catch (err) {
    console.error('Resend verification error:', err)
    toast.add({
      title: 'Error',
      description: 'Failed to send verification email. Please try again.',
      color: 'error',
    })
  }
  finally {
    resendPending.value = false
  }
}

// Error message helpers
function getErrorTitle(statusCode?: number): string {
  switch (statusCode) {
    case 400:
      return 'Invalid input'
    case 401:
      return 'Invalid credentials'
    case 403:
      return 'Email verification required'
    case 429:
      return 'Too many attempts'
    case 500:
      return 'Server error'
    default:
      return 'Sign in failed'
  }
}

function getErrorMessage(error: H3Error): string {
  switch (error.statusCode) {
    case 400:
      return 'Please check your input and try again.'
    case 401:
      return 'The email or password you entered is incorrect.'
    case 403:
      return 'Please verify your email address to continue.'
    case 429:
      return 'Too many login attempts. Please try again later.'
    case 500:
      return 'Something went wrong on our end. Please try again.'
    default:
      return 'An unexpected error occurred. Please try again.'
  }
}
</script>
