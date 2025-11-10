<template>
  <UContainer class="flex flex-col items-center justify-center min-h-[calc(100vh-(var(--ui-header-height)*2))] gap-4 p-4">
    <UPageCard
      class="w-full max-w-md"
      highlight
      highlight-color="secondary"
    >
      <div class="text-center space-y-6">
        <!-- Header -->
        <div class="space-y-2">
          <UIcon
            name="i-lucide-mail-check"
            class="w-12 h-12 mx-auto text-primary"
          />
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Verify Your Email
          </h1>
        </div>

        <!-- Verification states -->
        <div class="space-y-4">
          <!-- Loading state -->
          <UAlert
            v-if="verifying"
            color="tertiary"
            title="Verifying..."
            description="Please wait while we verify your email address."
            class="animate-pulse"
          />

          <!-- Success state -->
          <UAlert
            v-else-if="verified"
            color="success"
            icon="i-lucide-check-circle"
            title="Email verified successfully!"
            description="Your email has been verified. You can now access all features."
          />

          <!-- Error state -->
          <UAlert
            v-else-if="error"
            color="error"
            icon="i-lucide-alert-circle"
            :title="getErrorTitle(error.statusCode)"
            :description="getErrorMessage(error)"
          />

          <!-- No token state -->
          <UAlert
            v-else-if="!token"
            color="warning"
            icon="i-lucide-alert-triangle"
            title="Invalid verification token"
            description="The verification token is missing or invalid."
          />
        </div>

        <!-- Actions -->
        <div class="space-y-3">
          <!-- Success actions -->
          <template v-if="verified">
            <UButton
              color="primary"
              size="lg"
              block
              loading
              disabled
            >
              Redirecting...
            </UButton>
          </template>

          <!-- Error actions -->
          <template v-else-if="error || !token">
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              block
              @click="navigateTo('/login')"
            >
              Back to Sign In
            </UButton>
          </template>

          <!-- Loading actions -->
          <template v-else-if="verifying">
            <UButton
              color="neutral"
              variant="ghost"
              size="sm"
              block
              @click="navigateTo('/login')"
            >
              Back to Sign In
            </UButton>
          </template>
        </div>
      </div>
    </UPageCard>
  </UContainer>
</template>

<script setup lang="ts">
import type { H3Error } from 'h3'

// Define the page metadata
definePageMeta({
  middleware: 'guest',
  title: 'Verify Email',
  description: 'Verify your email address',
})

const route = useRoute()
const toast = useToast()
const { refresh } = useAuth()

// Form states
const verifying = ref(true)
const verified = ref(false)
const error = ref<H3Error | null>(null)

// Extract token from URL
const token = computed(() => route.query.token as string)

// Verify email on mount
onMounted(async () => {
  if (token.value) {
    await verifyEmail()
  }
})

// Verify email function
async function verifyEmail() {
  try {
    verifying.value = true
    error.value = null

    // Call email verification API endpoint
    await $fetch('/api/v1/auth/email/verify', {
      method: 'POST',
      body: { token: token.value },
    })

    // Success state
    verified.value = true

    // Success toast
    toast.add({
      title: 'Email verified!',
      description: 'Your email address has been successfully verified. Signing you in...',
      color: 'success',
      icon: 'i-lucide-check-circle',
    })

    // Refresh auth state and redirect after a short delay
    await refresh()
    setTimeout(() => {
      navigateTo('/')
    }, 2000)
  }
  catch (err) {
    console.error('Email verification error:', err)

    // Set error for display in template
    if (err && typeof err === 'object' && 'statusCode' in err) {
      error.value = err as H3Error
    }
    else {
      error.value = { statusCode: 500, message: 'An unexpected error occurred' } as H3Error
    }

    // Error toast
    toast.add({
      title: 'Verification failed',
      description: 'There was a problem verifying your email address.',
      color: 'error',
      icon: 'i-lucide-alert-circle',
    })
  }
  finally {
    verifying.value = false
  }
}

// Error message helpers
function getErrorTitle(statusCode?: number): string {
  switch (statusCode) {
    case 400:
      return 'Invalid verification link'
    case 401:
      return 'Verification failed'
    case 404:
      return 'Token not found'
    case 410:
      return 'Token expired'
    case 422:
      return 'Already verified'
    case 500:
      return 'Server error'
    default:
      return 'Verification failed'
  }
}

function getErrorMessage(error: H3Error): string {
  switch (error.statusCode) {
    case 400:
      return 'The verification token is invalid or malformed.'
    case 401:
      return 'Unable to verify your email address with this token.'
    case 404:
      return 'The verification token was not found.'
    case 410:
      return 'This verification token has expired. Please request a new one.'
    case 422:
      return 'This email address has already been verified.'
    case 500:
      return 'Something went wrong on our end. Please try again.'
    default:
      return 'An unexpected error occurred. Please try again.'
  }
}
</script>
