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
            Email Verification
          </h1>
        </div>

        <!-- Verification states -->
        <div class="space-y-4">
          <!-- Success state -->
          <UAlert
            v-if="data"
            color="success"
            icon="i-lucide-check-circle"
            title="Email verified successfully!"
            description="Your email has been verified. Redirecting you now..."
          />

          <!-- Error state -->
          <UAlert
            v-else-if="error"
            color="error"
            icon="i-lucide-alert-circle"
            :title="getErrorMessage(error) ?? 'Verification failed'"
          />
        </div>
      </div>
    </UPageCard>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  title: 'Verify Email',
  description: 'Verify your email address',
})

const route = useRoute()
const { user, fetch: refreshSession } = useUserSession()

// Extract token from URL
const token = route.query.token as string

// Verify email directly in page
const { data, error } = await useAsyncData('verify-email', async () => {
  const response = await $fetch('/api/v2/auth/email/verify', {
    method: 'POST',
    body: { token },
  })

  return response
})

// Redirect on success
if (data.value && !error.value) {
  await refreshSession()

  console.log(user.value)

  setTimeout(() => {
    navigateTo('/')

    console.log('Redirecting to home page...')
  }, 2000)
}
</script>
