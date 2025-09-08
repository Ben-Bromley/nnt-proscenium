<template>
  <UApp>
    <NuxtRouteAnnouncer />

    <UBanner
      id="under-construction"
      title="This site is still under construction."
      close
    />

    <UBanner
      v-if="showSetupBanner"
      id="account-setup"
      title="Complete your account setup to access all features."
      color="secondary"
      :actions="[
        {
          label: 'Complete Setup',
          color: 'primary',
          variant: 'outline',
          size: 'md',
          to: '/account/setup',
        },
      ]"
    />

    <AppHeader />

    <UMain>
      <NuxtLayout>
        <NuxtPage />
      </NuxtLayout>
    </UMain>

    <AppFooter />
  </UApp>
</template>

<script setup lang="ts">
useHead({
  titleTemplate: '%s | The Nottingham New Theatre',
})

const colorMode = useColorMode()
colorMode.preference = 'dark'

// Setup banner logic
const { user } = useUserSession()

const showSetupBanner = computed(() => {
  // Only show for authenticated users
  if (!user.value) return false

  // Don't show if user hasn't verified email yet
  if (!user.value.emailVerified) return false

  // Don't show if user has already completed setup
  if (user.value.setupCompleted) return false

  return true
})
</script>
