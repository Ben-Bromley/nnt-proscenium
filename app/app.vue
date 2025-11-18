<template>
  <UApp>
    <NuxtRouteAnnouncer />

    <UBanner
      id="under-construction"
      title="This site is still under construction."
      close
    />

    <ClientOnly>
      <!-- <UBanner
        v-if="user && !isSetupCompleted"
        id="account-setup"
        title="Complete your account setup to access all features."
        color="warning"
        :actions="[
          {
            label: 'Complete Setup',
            color: 'primary',
            variant: 'outline',
            size: 'md',
            to: '/account/setup',
          },
        ]"
      /> -->

      <UBanner
        v-if="user && !isEmailVerified"
        id="email-verification"
        title="Please verify your email address to secure your account."
        color="warning"
        :actions="[
          {
            label: 'Resend Verification Email',
            color: 'primary',
            variant: 'outline',
            size: 'md',
            onClick: resendVerificationEmail,
          },
        ]"
      />
    </ClientOnly>

    <!-- TODO: Replace this approach. it's really hacky and I hate it -->

    <template v-if="isDashboardLayout">
      <!-- Dashboard layout handles its own structure -->
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </template>

    <template v-else>
      <!-- Standard layout with header/main/footer -->
      <AppHeader />

      <UMain>
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </UMain>

      <AppFooter />
    </template>
  </UApp>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: '%s | The Nottingham New Theatre',
})

const colorMode = useColorMode()
colorMode.preference = 'dark'

// Check if current page uses admin layout (dashboard)
const route = useRoute()
const isDashboardLayout = computed(() => {
  // Check if the page meta specifies admin layout
  return route.meta.layout === 'admin'
})

// Setup banner logic
const { user, isEmailVerified } = useAuth()

const toast = useToast()

const resendVerificationEmail = async () => {
  if (!user.value?.email) return

  try {
    await $fetch('/api/v2/auth/email/request', {
      method: 'POST',
      body: { email: user.value.email },
    })

    toast.add({
      title: 'Verification email sent',
      description: 'Please check your inbox.',
      color: 'success',
    })
  }
  catch (error) {
    toast.add({
      title: 'Error',
      description: getErrorMessage(error),
      color: 'error',
    })
  }
}
</script>
