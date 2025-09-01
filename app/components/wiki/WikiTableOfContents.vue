<template>
  <div
    v-if="tocLinks && tocLinks.length > 0"
    class="toc-container"
  >
    <h3>On This Page</h3>
    <nav class="toc-nav">
      <ul class="toc-list">
        <WikiTableOfContentsItem
          v-for="link in tocLinks"
          :key="link.id"
          :link="link"
        />
      </ul>
    </nav>
  </div>
</template>

<script lang="ts" setup>
interface TocLink {
  id: string
  depth: number
  text: string
  children?: TocLink[]
}

interface PageWithToc {
  body?: {
    toc?: {
      links?: TocLink[]
    }
  }
}

interface Props {
  page?: unknown
}

const props = withDefaults(defineProps<Props>(), {
  page: undefined,
})

// Get page data from prop
const pageData = computed(() => {
  return props.page as PageWithToc | undefined
})

const tocLinks = computed(() => {
  return pageData.value?.body?.toc?.links || []
})
</script>

<style scoped>
/* Updated to use project CSS variables for unified theming */
.toc-container {
  border: 1px solid var(--border-color);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  background-color: var(--secondary-bg-color);
  overflow-y: auto;
  max-height: calc(100vh - var(--header-height) - 4rem - 2rem); /* viewport - header - layout padding - bottom gap */
}

/* Custom scrollbar within the table of contents container */
.toc-container::-webkit-scrollbar {
  width: 8px;
}

.toc-container::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
  border-radius: var(--border-radius);
}

.toc-container::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--border-radius);
  transition: background-color var(--transition-fast);
}

.toc-container::-webkit-scrollbar-thumb:hover {
  background: var(--nnt-purple);
}

.toc-container::-webkit-scrollbar-thumb:active {
  background: var(--nnt-orange);
}

/* Firefox scrollbar styling */
.toc-container {
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) rgba(0, 0, 0, 0.1);
}

.toc-container h3 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: 0.95rem;
  color: var(--primary-text-color);
  font-weight: 600;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

.toc-nav {
  margin: 0;
}

.toc-list {
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.95rem;
  color: var(--primary-text-color);
}

@media (max-width: 1024px) {
  .toc-container {
    max-height: none;
    overflow-y: visible;
  }

  /* Hide custom scrollbar on tablet and mobile since ToC is hidden */
  .toc-container::-webkit-scrollbar {
    display: none;
  }
}
</style>
