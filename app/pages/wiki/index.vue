<template>
  <div>
    <!-- Breadcrumbs -->
    <WikiBreadcrumbs :current-path="$route.path" />

    <!-- Show page content if it exists -->
    <article
      v-if="page"
      class="prose"
    >
      <ContentRenderer :value="page" />
    </article>

    <!-- Fallback content if no index page -->
    <div
      v-else
      class="wiki-home-fallback"
    >
      <h1>Wiki</h1>
      <p>Welcome to the New Theatre Wiki - your guide to our theatre.</p>
    </div>

    <!-- Show children grid -->
    <WikiGrid
      heading="Categories"
      :navigation="navigation || []"
      :current-path="$route.path"
    />

    <!-- Edit actions for the wiki index page -->
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
// Set layout
definePageMeta({
  layout: 'wiki',
})

// Fetch page content for wiki index
const { data: page } = await useAsyncData('wiki-index', async () => {
  try {
    return await queryCollection('wiki').path('/wiki').first()
  }
  catch {
    // No index page - that's fine, we'll show fallback
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
</script>

<style scoped>
/* Updated to use project CSS variables for unified theming */
.wiki-home-fallback {
  margin-bottom: var(--spacing-xl);
}

.wiki-home-fallback h1 {
  margin-bottom: var(--spacing-md);
}

.wiki-home-fallback p {
  color: var(--secondary-text-color);
  font-size: 1.125rem;
}
</style>
