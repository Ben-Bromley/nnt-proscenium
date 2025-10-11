<template>
  <div class="space-y-6">
    <UPageHeader
      title="Admin Dashboard"
      description="Overview of your theatre's operations and system status"
    />

    <UAlert
      color="warning"
      variant="soft"
      title="Warning"
      description="The admin panel is a work in progress. Some features may be incomplete, not fully functional, or contain placeholder data."
      icon="i-heroicons-exclamation-triangle"
    />

    <AdminWelcome :user="user" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <UCard class="col-span-1 lg:col-span-2">
        <template #header>
          <h3 class="font-semibold">
            Quick Actions
          </h3>
        </template>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UButton
            to="/admin/users"
            color="primary"
            variant="outline"
            block
            size="lg"
          >
            <template #leading>
              <UIcon name="i-heroicons-user-group" />
            </template>
            Manage Users
          </UButton>

          <UButton
            to="/admin/shows"
            color="primary"
            variant="outline"
            block
            size="lg"
          >
            <template #leading>
              <UIcon name="i-heroicons-squares-2x2" />
            </template>
            Manage Shows
          </UButton>

          <UButton
            to="/admin/venues"
            color="primary"
            variant="outline"
            block
            size="lg"
          >
            <template #leading>
              <UIcon name="i-heroicons-building-office" />
            </template>
            Manage Venues
          </UButton>

          <UButton
            to="/admin/tickets"
            color="primary"
            variant="outline"
            block
            size="lg"
          >
            <template #leading>
              <UIcon name="i-heroicons-ticket" />
            </template>
            View Tickets
          </UButton>
        </div>
      </UCard>

      <UCard>
        <template #header>
          <h3 class="font-semibold">
            System Status
          </h3>
        </template>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-sm">Database</span>
            <UBadge
              color="success"
              variant="subtle"
            >
              Healthy
            </UBadge>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm">Storage</span>
            <UBadge
              color="success"
              variant="subtle"
            >
              Healthy
            </UBadge>
          </div>

          <div class="flex items-center justify-between">
            <span class="text-sm">Last Backup</span>
            <span class="text-sm text-gray-500 dark:text-gray-400">
              2 hours ago
            </span>
          </div>
        </div>
      </UCard>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <UCard>
        <div class="flex items-center">
          <UIcon
            name="i-heroicons-user-group"
            class="size-8 text-blue-500"
          />
          <div class="ml-4">
            <p class="text-2xl font-semibold">
              124
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Total Users
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <UIcon
            name="i-heroicons-squares-2x2"
            class="size-8 text-green-500"
          />
          <div class="ml-4">
            <p class="text-2xl font-semibold">
              8
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Active Shows
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <UIcon
            name="i-heroicons-ticket"
            class="size-8 text-purple-500"
          />
          <div class="ml-4">
            <p class="text-2xl font-semibold">
              342
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Tickets Sold
            </p>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center">
          <UIcon
            name="i-heroicons-building-office"
            class="size-8 text-orange-500"
          />
          <div class="ml-4">
            <p class="text-2xl font-semibold">
              3
            </p>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Venues
            </p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
  layout: 'admin',
})

const { user } = useAuth()
</script>
