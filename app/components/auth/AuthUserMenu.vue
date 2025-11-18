<template>
  <UDropdownMenu :items="menuItems">
    <UAvatar
      :src="user?.profile?.avatar || ''"
      :alt="user?.profile?.name || user?.email || 'User avatar'"
      size="md"
      class="cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all"
    />
  </UDropdownMenu>
</template>

<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { user, clearSession } = useAuth()

// Check if user has admin access
const hasAdminAccess = computed(() => {
  return user.value?.roles?.includes('ADMIN')
})

// Handle sign out
const handleLogout = async () => {
  try {
    await $fetch('/api/v2/auth/logout', {
      method: 'POST',
    })

    // Clear the session
    await clearSession()

    // Force navigation to login page
    await navigateTo('/login', { replace: true, external: true })
  }
  catch (error) {
    console.error('Error logging out:', error)
  }
}

// Menu items configuration
const menuItems = computed<DropdownMenuItem[][]>(() => {
  const items: DropdownMenuItem[][] = [
    // User info section
    [
      {
        label: user.value?.profile?.name || user.value?.email || 'User',
        avatar: {
          src: user.value?.profile?.avatar || '',
          alt: user.value?.profile?.name || user.value?.email || 'User avatar',
        },
        type: 'label',
      },
    ],
    // Navigation items
    [
      {
        label: 'My Profile',
        icon: 'icon:account',
        to: '/account',
      },
    ],
  ]

  // Add admin link if user has admin access
  if (hasAdminAccess.value) {
    const navigationItems = items[1]
    if (navigationItems) {
      navigationItems.push({
        label: 'Admin Dashboard',
        icon: 'icon:settings',
        to: '/admin',
      })
    }
  }

  // Add logout section
  items.push([
    {
      label: 'Sign Out',
      icon: 'icon:logout',
      color: 'error',
      onSelect: handleLogout,
    },
  ])

  return items
})
</script>
