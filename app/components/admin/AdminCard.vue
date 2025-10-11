<template>
  <UPageCard
    :title="title"
    :description="description"
    :to="path"
    :icon="getIconName(icon)"
    variant="outline"
    class="hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
  />
</template>

<script setup lang="ts">
interface Props {
  title: string
  description: string
  path: string
  icon: string
}

defineProps<Props>()

// Map icon names to Heroicons
const getIconName = (iconName: string) => {
  const iconMap: Record<string, string> = {
    account: 'i-heroicons-user-group',
    door: 'i-heroicons-building-office',
    menu: 'i-heroicons-squares-2x2',
    warning: 'i-heroicons-exclamation-triangle',
    ticket: 'i-heroicons-ticket',
    su: 'i-heroicons-users',
  }

  return iconMap[iconName] || `i-heroicons-${iconName}`
}
</script>
