<template>
  <div class="children-grid prose">
    <h2 v-if="children.length > 0">
      {{ heading || 'Children' }}
    </h2>

    <div
      v-if="children.length > 0"
      class="grid"
    >
      <div
        v-for="child in children"
        :key="child.path"
        class="grid-item"
      >
        <div class="item-header">
          <NuxtLink
            :to="child.path"
            class="item-title"
          >
            {{ child.title }}
          </NuxtLink>
        </div>

        <DevOnly>
          <div class="item-stats">
            <div class="stat">
              <span class="stat-label">Direct Children:</span>
              <span class="stat-value">{{ getDirectChildrenCount(child) }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Total Descendants:</span>
              <span class="stat-value">{{ getTotalDescendantsCount(child) }}</span>
            </div>
          </div>
        </DevOnly>

        <!-- Preview of direct children if they exist -->
        <div
          v-if="child.children && child.children.length > 0"
          class="children-preview"
        >
          <h4>Contains:</h4>
          <ul class="preview-list">
            <li
              v-for="grandchild in child.children.slice(0, 3)"
              :key="grandchild.path"
            >
              <NuxtLink
                :to="grandchild.path"
                class="preview-link"
              >
                {{ grandchild.title }}
              </NuxtLink>
            </li>
            <li
              v-if="child.children.length > 3"
              class="more-items"
            >
              ... and {{ child.children.length - 3 }} more
            </li>
          </ul>
        </div>
      </div>
    </div>

    <p
      v-else
      class="no-children"
    >
      No child pages found.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'
import { findPageChildren } from '@nuxt/content/utils'

interface Props {
  navigation: ContentNavigationItem[]
  currentPath: string
  heading?: string
}

const props = defineProps<Props>()

// Find children for the current path
const children = computed(() => {
  return findPageChildren(props.navigation, props.currentPath) || []
})

// Helper function to count direct children
const getDirectChildrenCount = (item: ContentNavigationItem): number => {
  return item.children ? item.children.length : 0
}

// Helper function to count total descendants (children, grandchildren, etc.)
const getTotalDescendantsCount = (item: ContentNavigationItem): number => {
  if (!item.children) return 0

  let total = item.children.length

  item.children.forEach((child) => {
    total += getTotalDescendantsCount(child)
  })

  return total
}
</script>

<style scoped>
/* Improved theming and accessibility using project CSS variables */
.children-grid h2 {
  margin: 0 0 var(--spacing-lg) 0;
  font-size: 1.2rem;
  color: var(--primary-text-color);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: var(--spacing-lg);
}

.grid-item {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
  background-color: var(--secondary-bg-color);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: box-shadow var(--transition-fast), transform var(--transition-fast);
}

.grid-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.item-header {
  margin-bottom: var(--spacing-md);
}

.item-title {
  text-decoration: none;
  color: var(--nnt-purple);
  font-size: 1.1rem;
  font-weight: 600;
  display: block;
  transition: color var(--transition-fast);
}

.item-title:hover {
  text-decoration: underline;
  color: var(--nnt-orange);
}

.item-stats {
  margin-bottom: var(--spacing-md);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
  font-size: 0.9rem;
}

.stat {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: var(--secondary-text-color);
}

.stat-value {
  font-weight: bold;
  color: var(--primary-text-color);
  background-color: var(--primary-bg-color);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  min-width: 2rem;
  text-align: center;
}

.children-preview {
  border-top: 1px solid var(--border-color);
  padding-top: var(--spacing-md);
}

.children-preview h4 {
  margin: 0 0 var(--spacing-xs) 0;
  font-size: 0.9rem;
  color: var(--secondary-text-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.preview-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.preview-list li {
  margin-bottom: var(--spacing-xs);
}

.preview-link {
  text-decoration: none;
  color: var(--nnt-purple);
  font-size: 0.9rem;
  transition: color var(--transition-fast);
}

.preview-link:hover {
  text-decoration: underline;
  color: var(--nnt-orange);
}

.more-items {
  color: var(--secondary-text-color);
  font-style: italic;
  font-size: 0.85rem;
}

.no-children {
  color: var(--secondary-text-color);
  font-style: italic;
  margin: 0;
  text-align: center;
  padding: var(--spacing-xl);
}

@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .item-stats {
    font-size: 0.8rem;
  }
}
</style>
