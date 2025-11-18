<template>
  <div>
    <!-- User is authenticated -->
    <AuthUserMenu v-if="loggedIn" />
    <!-- User is not authenticated -->
    <UButton
      v-else
      to="/login"
      icon="icon:login"
      color="neutral"
      variant="ghost"
      size="md"
      square
      aria-label="Log in to your account"
    />
  </div>
</template>

<script setup lang="ts">
const { loggedIn } = useAuth()
</script>
