<template>
  <div class="wiki-layout">
    <AppHeader />

    <div class="wiki-container">
      <!-- Left Sidebar - Navigation -->
      <aside class="sidebar-nav">
        <WikiNavigation
          v-if="navigation && navigation.length > 0"
          :navigation="navigation"
          :current-path="$route.path"
        />
        <div
          v-else
          class="no-navigation"
        >
          <p>No navigation available</p>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content">
        <slot />
      </main>

      <!-- Right Sidebar - Table of Contents -->
      <aside class="toc-sidebar">
        <WikiTableOfContents :page="currentPage" />
      </aside>
    </div>
  </div>
</template>

<script lang="ts" setup>
// Fetch navigation data for the wiki
const route = useRoute()
const { data: navigation } = await useAsyncData(`wiki-navigation-${route.path}`, async () => {
  try {
    return await queryCollectionNavigation('wiki')
  }
  catch (error) {
    console.warn('Failed to load wiki navigation', error)
    return []
  }
})

// Fetch current page data for table of contents
const { data: currentPage } = await useAsyncData(`wiki-page-toc-${route.path}`, () => {
  return queryCollection('wiki').path(route.path).first()
}, {
  watch: [route],
})
</script>

<style scoped>
.wiki-layout {
  min-height: 100vh;
}

.wiki-container {
  display: grid;
  grid-template-columns: 250px 1fr 200px;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  min-height: calc(100vh - var(--header-height));
}

.sidebar-nav {
  position: sticky;
  top: calc(var(--header-height) + 1rem); /* Header height + gap */
  height: fit-content;
  max-height: calc(100vh - var(--header-height) - 2rem - 2rem); /* viewport - header - top gap - bottom gap */
  padding-bottom: 1rem; /* Ensure content doesn't touch the bottom */
}

.main-content {
  min-width: 0;
  padding: 0 1rem;
}

.toc-sidebar {
  position: sticky;
  top: calc(var(--header-height) + 1rem); /* Header height + gap */
  height: fit-content;
  max-height: calc(100vh - var(--header-height) - 2rem - 2rem); /* viewport - header - top gap - bottom gap */
  padding-bottom: 1rem; /* Ensure content doesn't touch the bottom */
}

.no-navigation {
  border: 1px solid var(--border-color);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  background-color: var(--secondary-bg-color);
}

.no-navigation p {
  margin: 0;
  color: var(--secondary-text-color);
  font-style: italic;
  font-size: 0.9rem;
}

/* Responsive design */
@media (max-width: 1024px) {
  .wiki-container {
    grid-template-columns: 200px 1fr;
    gap: 1rem;
  }

  .toc-sidebar {
    display: none;
  }
}

@media (max-width: 768px) {
  .wiki-container {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .sidebar-nav {
    position: static;
    height: auto;
    max-height: none;
    order: 2;
    top: auto;
    padding-bottom: 0;
  }

  .main-content {
    order: 1;
    padding: 0;
  }
}
</style>
