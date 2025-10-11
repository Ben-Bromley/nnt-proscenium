<template>
  <UDashboardGroup>
    <UDashboardSidebar
      collapsible
      resizable
      :default-size="18"
      :min-size="12"
      :max-size="25"
    >
      <template #header="{ collapsed }">
        <div class="flex items-center gap-2">
          <ULink
            to="/"
          >
            <BrandLogo
              v-if="!collapsed"
              class="h-6 w-auto"
            />
            <UIcon
              v-else
              name="i-heroicons-squares-2x2"
              class="size-6 text-primary mx-auto"
            />
          </ULink>
        </div>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu
          :collapsed="collapsed"
          :items="adminNavigation"
          orientation="vertical"
        />
      </template>

      <template #footer="{ collapsed }">
        <AuthStatus v-if="!collapsed" />
        <UButton
          v-else
          icon="i-heroicons-user-circle"
          color="neutral"
          variant="ghost"
          square
        />
      </template>
    </UDashboardSidebar>

    <UDashboardPanel>
      <template #header>
        <UDashboardNavbar :title="pageTitle">
          <template #leading>
            <UDashboardSidebarCollapse />
          </template>

          <template #right>
            <div class="hidden sm:flex items-center gap-2">
              <UColorModeButton />
            </div>
          </template>
        </UDashboardNavbar>
      </template>

      <template #body>
        <slot />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>

<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

// Get page title from route meta or generate from path
const route = useRoute()
const pageTitle = computed(() => {
  // Use explicit title from page meta if available
  if (route.meta.title) {
    return route.meta.title as string
  }

  // Generate title from path
  const path = route.path
  if (path === '/admin' || path === '/admin/') {
    return 'Dashboard'
  }

  // Convert path segments to title
  const segments = path.split('/').filter(Boolean)
  if (segments.length >= 2) {
    const section = segments[1]
    if (section) {
      return section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, ' ')
    }
  }

  return 'Admin'
})

// Admin navigation items based on the existing admin sections
const adminNavigation: NavigationMenuItem[][] = [[
  {
    label: 'Dashboard',
    icon: 'i-heroicons-home',
    to: '/admin',
    exact: true,
  },
  {
    label: 'User Management',
    icon: 'i-heroicons-user-group',
    to: '/admin/users',
  },
  {
    label: 'Venues',
    icon: 'i-heroicons-building-office',
    to: '/admin/venues',
  },
  {
    label: 'Shows',
    icon: 'i-heroicons-squares-2x2',
    to: '/admin/shows',
    children: [
      {
        label: 'All Shows',
        to: '/admin/shows',
      },
      {
        label: 'Performances',
        to: '/admin/performances',
      },
    ],
  },
  {
    label: 'Ticketing',
    icon: 'i-heroicons-ticket',
    to: '/admin/tickets',
    children: [
      {
        label: 'Tickets',
        to: '/admin/tickets',
      },
      {
        label: 'Reservations',
        to: '/admin/reservations',
      },
    ],
  },
], [
  {
    label: 'Content Warnings',
    icon: 'i-heroicons-exclamation-triangle',
    to: '/admin/content-warnings',
  },
  {
    label: 'Festivals',
    icon: 'i-heroicons-calendar-days',
    to: '/admin/festivals',
  },
  {
    label: 'Front of House',
    icon: 'i-heroicons-users',
    to: '/admin/foh',
  },
]]
</script>
