<template>
  <UCard
    variant="soft"
    class="mb-8"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <UIcon
          name="i-heroicons-user-circle"
          class="size-8 text-primary"
        />
        <div>
          <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
            Welcome, {{ user?.profile?.name || user?.email }}!
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Admin Dashboard Access
          </p>
        </div>
      </div>
    </template>

    <div class="flex items-center gap-2">
      <UBadge
        v-for="(role, index) in user?.roles"
        :key="index"
        variant="subtle"
      >
        {{ role }}
      </UBadge>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { User } from '#auth-utils'

interface Props {
  user: User | undefined
}

defineProps<Props>()
</script>
