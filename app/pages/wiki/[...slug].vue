<template>
  <div>
    <!-- Breadcrumbs -->
    <WikiBreadcrumbs
      :current-path="$route.path"
      :page-title="page?.title"
    />

    <!-- Show page content if it exists -->
    <article
      v-if="page"
      class="prose"
    >
      <ContentRenderer :value="page" />
    </article>

    <!-- Show children grid if page has children -->
    <div v-if="hasChildren">
      <WikiGrid
        :navigation="navigation || []"
        :current-path="$route.path"
      />
    </div>

    <!-- Show 404 if neither page nor children exist -->
    <!-- TODO: Throw a 404 error instead (once I've added a custom error.vue page) -->
    <div
      v-else-if="!page && !hasChildren"
      class="not-found"
    >
      <h1>Page Not Found</h1>
      <p>The requested wiki page could not be found.</p>
      <NuxtLink
        to="/wiki"
        class="back-link"
      >
        ← Back to Wiki
      </NuxtLink>
    </div>

    <!-- Show pagination for document pages -->
    <WikiPagination
      v-if="page && navigation && navigation.length > 0"
      :navigation="navigation"
      :current-path="$route.path"
    />

    <!-- Edit actions for existing pages -->
    <WikiEditActions
      v-if="page"
      :current-path="$route.path"
    />

    <DevOnly>
      <hr>
      <div class="debug-info">
        <h3>Debug Info:</h3>
        <p><strong>Path:</strong> {{ $route.path }}</p>
        <p><strong>Has Page:</strong> {{ !!page }}</p>
        <p><strong>Has Children:</strong> {{ hasChildren }}</p>
        <p><strong>Page Title:</strong> {{ pageTitle }}</p>
        <details>
          <summary>Page Data</summary>
          <pre>{{ page }}</pre>
        </details>
        <details>
          <summary>Navigation Data</summary>
          <pre>{{ navigation }}</pre>
        </details>
      </div>
    </DevOnly>
  </div>
</template>

<script lang="ts" setup>
import type { ContentNavigationItem } from '@nuxt/content'

const route = useRoute()

// Set layout and handle redirects
definePageMeta({
  layout: 'wiki',
})

// Fetch page content
const { data: page } = await useAsyncData(route.path, async () => {
  try {
    return await queryCollection('wiki').path(route.path).first()
  }
  catch {
    // Page doesn't exist - that's fine, we'll check for children
    return null
  }
})

// Handle redirects if page has redirect property
if (page.value?.redirect) {
  await navigateTo(page.value.redirect, { redirectCode: 301, replace: true })
}

// Fetch navigation data
const { data: navigation } = await useAsyncData('wiki-navigation', async () => {
  try {
    return await queryCollectionNavigation('wiki')
  }
  catch (error) {
    console.warn('Failed to load wiki navigation', error)
    return []
  }
})

// Check if current path has children
const hasChildren = computed(() => {
  if (!navigation.value) return false

  const findPageInNavigation = (items: ContentNavigationItem[], targetPath: string): ContentNavigationItem | null => {
    for (const item of items) {
      if (item.path === targetPath) {
        return item
      }
      if (item.children) {
        const found = findPageInNavigation(item.children, targetPath)
        if (found) return found
      }
    }
    return null
  }

  const currentNavItem = findPageInNavigation(navigation.value, route.path)
  return currentNavItem?.children && currentNavItem.children.length > 0
})

// Generate page title from path if no page content
const pageTitle = computed(() => {
  if (page.value?.title) return page.value.title

  const pathSegments = route.path.split('/').filter(Boolean)
  if (pathSegments.length > 1) {
    const lastSegment = pathSegments[pathSegments.length - 1]
    if (lastSegment) {
      return lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace(/-/g, ' ')
    }
  }

  return 'Wiki'
})

// Set proper status code for 404s
if (import.meta.server && !page.value && !hasChildren.value) {
  setResponseStatus(404)
}
</script>

<style scoped>
/* Updated to use project CSS variables for unified theming */
.not-found {
  text-align: center;
  padding: var(--spacing-xxl) var(--spacing-md);
}

.not-found h1 {
  color: var(--danger-color);
  margin-bottom: var(--spacing-md);
}

.not-found p {
  color: var(--alt-text-color);
  margin-bottom: var(--spacing-xl);
  font-size: 1.125rem;
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  color: var(--nnt-purple);
  text-decoration: none;
  font-weight: 500;
  padding: var(--spacing-sm) var(--spacing-xl);
  border: 1px solid var(--nnt-purple);
  border-radius: var(--border-radius);
  transition: all var(--transition-fast);
}

.back-link:hover {
  background-color: var(--nnt-purple);
  color: white;
}

.debug-info {
  border: 1px solid var(--border-color);
  padding: var(--spacing-md);
  margin-top: var(--spacing-xl);
  border-radius: var(--border-radius-sm);
  background-color: var(--background-alt-color);
  font-size: 0.875rem;
}

.debug-info h3 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--primary-text-color);
}

.debug-info p {
  margin: var(--spacing-xxs) 0;
  color: var(--alt-text-color);
}

.debug-info details {
  margin-top: var(--spacing-md);
}

.debug-info pre {
  background-color: var(--background-accent-color);
  color: var(--primary-text-color);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-sm);
  font-size: 0.75rem;
  overflow-x: auto;
  margin: var(--spacing-xs) 0;
}
</style>
