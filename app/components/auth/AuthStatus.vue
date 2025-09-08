<template>
  <div>
    <!-- Show user menu when logged in -->
    <AuthUserMenu v-if="isLoggedIn" />

    <!-- Show login button when logged out -->
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
const { isLoggedIn } = useAuth()
</script>
