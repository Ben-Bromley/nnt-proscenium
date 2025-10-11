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
const { user } = useUserSession()

const showSetupBanner = computed(() => {
  // Only show for authenticated users
  if (!user.value) return false

  // Don't show if user hasn't verified email yet
  if (!user.value.emailVerified) return false

  // Don't show if user has already completed setup
  if (user.value.setupCompleted) return false

  // Don't show on admin pages to avoid layout conflicts
  if (isDashboardLayout.value) return false

  return true
})
</script>
