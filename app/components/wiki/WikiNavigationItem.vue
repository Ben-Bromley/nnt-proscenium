<template>
  <li class="nav-item">
    <!-- Always show as a clickable link if it has a path -->
    <NuxtLink
      :to="item.path"
      class="nav-link"
      :class="{ 'current-page': item.path === currentPath }"
    >
      {{ item.title }}
    </NuxtLink>

    <!-- Recursively show children if they exist (this is the key - it will keep calling itself) -->
    <ul
      v-if="hasVisibleChildren"
      class="nav-children"
    >
      <WikiNavigationItem
        v-for="child in filteredChildren"
        :key="child.path"
        :item="child"
        :current-path="currentPath"
      />
    </ul>
  </li>
</template>

<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

interface Props {
  item: ContentNavigationItem
  currentPath: string
}

const props = defineProps<Props>()

// Filter out any children that have the same path as the parent (index pages)
const filteredChildren = computed(() => {
  if (!props.item.children) return []

  return props.item.children.filter(child => child.path !== props.item.path)
})

// Check if we have children to display
const hasVisibleChildren = computed(() => {
  return filteredChildren.value.length > 0
})
</script>

<style scoped>
.nav-item {
  margin-bottom: var(--spacing-xs);
}

.nav-link {
  display: block;
  padding: var(--spacing-xs) 0;
  color: var(--nnt-orange);
  text-decoration: none;
  font-weight: 500;
  transition: color var(--transition-fast);
}

.nav-link:hover {
  color: var(--nnt-orange-light);
  text-decoration: underline;
}

.nav-link.current-page {
  color: var(--primary-text-color);
  font-weight: bold;
  background-color: var(--nnt-purple);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  margin: calc(-1 * var(--spacing-xs)) calc(-1 * var(--spacing-sm));
}

.nav-children {
  list-style: none;
  padding: 0;
  margin: var(--spacing-sm) 0 0 var(--spacing-lg);
}

/* Nested styling for multiple levels */
.nav-children .nav-link {
  font-size: 0.9rem;
  font-weight: 400;
}

.nav-children .nav-children .nav-link {
  font-size: 0.85rem;
}

.nav-children .nav-children .nav-children .nav-link {
  font-size: 0.8rem;
  color: var(--secondary-text-color);
}

/* Visual indicators for deep nesting */
.nav-children .nav-children .nav-children {
  border-left: 1px solid var(--border-color);
  padding-left: var(--spacing-sm);
  margin-left: var(--spacing-sm);
}
</style>
