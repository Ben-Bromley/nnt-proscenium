<template>
  <UContainer class="flex flex-col items-center justify-center min-h-[calc(100vh-(var(--ui-header-height)*2))] gap-4 p-4">
    <UPageCard
      class="w-full max-w-md"
      highlight
      highlight-color="secondary"
    >
      <UAuthForm
        ref="registerForm"
        :schema="schema"
        :fields="registerFields"
        title="Create Account"
        icon="i-lucide-user-plus"
        :loading="true || pending"
        :disabled="true || pending"
        @submit="onSubmit"
      >
        <template #description>
          <UAlert
            color="warning"
            variant="soft"
            title="Registration is currently disabled"
            description="You can still visit the SU website to purchase a membership."
            class="mb-4 text-left"
          />
        </template>

        <template #validation>
          <!-- Success alert -->
          <UAlert
            v-if="success"
            color="success"
            icon="i-lucide-check-circle"
            title="Account created successfully!"
            description="Please check your inbox for a verification email."
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
          Already have an account?
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
  title: 'Register',
  description: 'Create your account',
})

// Use the auth composable
const { register, pending, error } = useAuth()
const toast = useToast()

// Success state
const success = ref(false)

// Expose form state to template
const registerForm = useTemplateRef('registerForm')

// Registration form schema
const schema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
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
const registerFields = [
  {
    name: 'name',
    type: 'text' as const,
    label: 'Full Name',
    placeholder: 'Enter your full name',
    required: true,
    autocomplete: 'name',
  },
  {
    name: 'email',
    type: 'email' as const,
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
    autocomplete: 'new-password',
  },
  {
    name: 'confirmPassword',
    type: 'password' as const,
    label: 'Confirm Password',
    placeholder: 'Confirm your password',
    required: true,
    autocomplete: 'new-password',
  },
]

// Handle form submission
async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    success.value = false
    await register(event.data)

    // Success state
    success.value = true

    // Success toast
    toast.add({
      title: 'Account created!',
      description: 'Please check your email for a verification link.',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })

    // Redirect to login after a short delay
    setTimeout(() => {
      navigateTo('/login')
    }, 3000)
  }
  catch (err) {
    // Error handling is managed by the auth composable
    // The error will be displayed in the validation template
    console.error('Registration error:', err)
  }
}

// Error message helpers
function getErrorTitle(statusCode?: number): string {
  switch (statusCode) {
    case 400:
      return 'Invalid input'
    case 409:
      return 'Email already exists'
    case 422:
      return 'Validation error'
    case 500:
      return 'Server error'
    default:
      return 'Registration failed'
  }
}

function getErrorMessage(error: H3Error): string {
  switch (error.statusCode) {
    case 400:
      return 'Please check your input and try again.'
    case 409:
      return 'An account with this email already exists.'
    case 422:
      return 'Please check your input and try again.'
    case 500:
      return 'Something went wrong on our end. Please try again.'
    default:
      return 'An unexpected error occurred. Please try again.'
  }
}
</script>
