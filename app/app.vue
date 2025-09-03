<template>
  <UApp>
    <NuxtRouteAnnouncer />

    <UBanner
      id="under-construction"
      title="This site is still under construction."
      close
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
</script>
