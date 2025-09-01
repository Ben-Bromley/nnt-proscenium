<template>
  <nav class="wiki-navigation">
    <!-- Category header (clickable if has index page) -->
    <div
      v-if="categoryInfo"
      class="category-header"
    >
      <h3>
        <NuxtLink
          v-if="categoryInfo.hasIndex"
          :to="categoryInfo.path"
          class="category-link"
          :class="{ 'current-page': categoryInfo.path === currentPath }"
        >
          {{ categoryInfo.title }}
        </NuxtLink>
        <span
          v-else
          class="category-title"
        >
          {{ categoryInfo.title }}
        </span>
      </h3>
    </div>

    <!-- Navigation items -->
    <ul
      v-if="navigationItems.length > 0"
      class="nav-list"
    >
      <WikiNavigationItem
        v-for="item in navigationItems"
        :key="item.path"
        :item="item"
        :current-path="currentPath"
      />
    </ul>

    <p
      v-else
      class="no-pages"
    >
      No pages found.
    </p>
  </nav>
</template>

<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

interface Props {
  navigation: ContentNavigationItem[]
  currentPath: string
}

const props = defineProps<Props>()

// Find an item in the navigation tree
const findInNavigation = (items: ContentNavigationItem[], targetPath: string): ContentNavigationItem | null => {
  for (const item of items) {
    if (item.path === targetPath) {
      return item
    }
    if (item.children) {
      const found = findInNavigation(item.children, targetPath)
      if (found) return found
    }
  }
  return null
}

// Get current category info
const categoryInfo = computed(() => {
  const pathSegments = props.currentPath.split('/').filter(Boolean)

  // At wiki root, no category header needed
  if (pathSegments.length <= 1) {
    return null
  }

  // In a category, show category info
  if (pathSegments.length >= 2 && pathSegments[0] === 'wiki') {
    const categoryPath = `/wiki/${pathSegments[1]}`
    const category = findInNavigation(props.navigation, categoryPath)

    if (category) {
      const fallbackTitle = pathSegments[1]
        ? pathSegments[1].charAt(0).toUpperCase() + pathSegments[1].slice(1).replace(/-/g, ' ')
        : 'Unknown Category'

      return {
        path: categoryPath,
        title: category.title || fallbackTitle,
        hasIndex: !!(category.path && category.children && category.children.length > 0),
      }
    }
  }

  return null
})

// Get items to show in navigation
const navigationItems = computed(() => {
  const pathSegments = props.currentPath.split('/').filter(Boolean)

  // At wiki root, show all top-level categories
  if (pathSegments.length <= 1) {
    const wikiRoot = findInNavigation(props.navigation, '/wiki')
    return wikiRoot?.children || []
  }

  // In a category, show that category's children (excluding any index page)
  if (pathSegments.length >= 2 && pathSegments[0] === 'wiki') {
    const categoryPath = `/wiki/${pathSegments[1]}`
    const category = findInNavigation(props.navigation, categoryPath)

    if (category?.children) {
      // Filter out any child that has the same path as the parent (index page)
      return category.children.filter(child => child.path !== category.path)
    }
  }

  return []
})
</script>

<style scoped>
.wiki-navigation {
  border: 1px solid var(--border-color);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  background-color: var(--secondary-bg-color);
  overflow-y: auto;
  max-height: calc(100vh - var(--header-height) - 4rem - 2rem); /* viewport - header - layout padding - bottom gap */
}

/* Custom scrollbar within the navigation container */
.wiki-navigation::-webkit-scrollbar {
  width: 8px;
}

.wiki-navigation::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--border-radius);
}

.wiki-navigation::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--border-radius);
  transition: background-color var(--transition-fast);
}

.wiki-navigation::-webkit-scrollbar-thumb:hover {
  background: var(--nnt-purple);
}

.wiki-navigation::-webkit-scrollbar-thumb:active {
  background: var(--nnt-orange);
}

/* Firefox scrollbar styling */
.wiki-navigation {
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) rgba(0, 0, 0, 0.1);
}

.category-header {
  margin-bottom: var(--spacing-lg);
  padding-bottom: var(--spacing-md);
  border-bottom: 1px solid var(--border-color);
}

.category-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: var(--primary-text-color);
}

.category-link {
  color: var(--nnt-orange);
  text-decoration: none;
  font-weight: 600;
  transition: color var(--transition-fast);
}

.category-link:hover {
  color: var(--nnt-orange-light);
  text-decoration: underline;
}

.category-link.current-page {
  color: var(--primary-text-color);
  background-color: var(--nnt-purple);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--border-radius);
  margin: calc(-1 * var(--spacing-xs)) calc(-1 * var(--spacing-sm));
}

.category-title {
  font-weight: 600;
  color: var(--primary-text-color);
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.no-pages {
  color: var(--secondary-text-color);
  font-style: italic;
  margin: 0;
}

@media (max-width: 768px) {
  .wiki-navigation {
    max-height: none;
    overflow-y: visible;
  }

  /* Hide custom scrollbar on mobile since it's not needed */
  .wiki-navigation::-webkit-scrollbar {
    display: none;
  }
}
</style>
