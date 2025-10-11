<template>
  <UPageGrid>
    <AdminCard
      v-for="section in sections"
      :key="section.path"
      :title="section.title"
      :description="section.description"
      :path="section.path"
      :icon="section.icon"
    />
  </UPageGrid>
</template>

<script setup lang="ts">
export interface AdminSection {
  title: string
  description: string
  path: string
  icon: string
}

interface Props {
  sections: AdminSection[]
}

defineProps<Props>()
</script>
