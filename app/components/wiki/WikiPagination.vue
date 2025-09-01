<template>
  <nav
    v-if="previousPage || nextPage"
    class="wiki-pagination"
  >
    <div class="pagination-container">
      <div class="previous-page">
        <NuxtLink
          v-if="previousPage"
          :to="previousPage.path"
          class="pagination-link previous"
        >
          <span class="arrow">←</span>
          <div class="link-content">
            <span class="link-label">Previous</span>
            <span class="link-title">{{ previousPage.title }}</span>
          </div>
        </NuxtLink>
      </div>

      <div class="next-page">
        <NuxtLink
          v-if="nextPage"
          :to="nextPage.path"
          class="pagination-link next"
        >
          <div class="link-content">
            <span class="link-label">Next</span>
            <span class="link-title">{{ nextPage.title }}</span>
          </div>
          <span class="arrow">→</span>
        </NuxtLink>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import type { ContentNavigationItem } from '@nuxt/content'

interface Props {
  navigation: ContentNavigationItem[]
  currentPath: string
}

const props = defineProps<Props>()

// Get flat list of all document pages in the current category
const allDocumentPages = computed(() => {
  const pages: ContentNavigationItem[] = []

  // Extract the category from current path
  const pathSegments = props.currentPath.split('/').filter(Boolean)

  if (pathSegments.length >= 2 && pathSegments[0] === 'wiki') {
    const categoryPath = `/wiki/${pathSegments[1]}` // e.g., "/wiki/getting-started"

    // Find the category in navigation
    const findCategoryInNavigation = (items: ContentNavigationItem[]): ContentNavigationItem | null => {
      for (const item of items) {
        if (item.path === categoryPath) {
          return item
        }
        if (item.children) {
          const found = findCategoryInNavigation(item.children)
          if (found) return found
        }
      }
      return null
    }

    const category = findCategoryInNavigation(props.navigation)

    // Collect all document pages within this category
    const collectPages = (items: ContentNavigationItem[]) => {
      for (const item of items) {
        if (!item.children || item.children.length === 0) {
          // This is a document page
          pages.push(item)
        }
        if (item.children) {
          collectPages(item.children)
        }
      }
    }

    if (category?.children) {
      collectPages(category.children)
    }
  }

  return pages
})

// Find current page index
const currentPageIndex = computed(() => {
  return allDocumentPages.value.findIndex(page => page.path === props.currentPath)
})

// Get previous and next pages
const previousPage = computed(() => {
  if (currentPageIndex.value > 0) {
    return allDocumentPages.value[currentPageIndex.value - 1]
  }
  return null
})

const nextPage = computed(() => {
  if (currentPageIndex.value >= 0 && currentPageIndex.value < allDocumentPages.value.length - 1) {
    return allDocumentPages.value[currentPageIndex.value + 1]
  }
  return null
})
</script>

<style scoped>
.wiki-pagination {
  margin-top: 3rem;
  /* Updated to use project CSS variables for unified theming */
  .wiki-pagination {
    border-top: 1px solid var(--border-color);
  }

  .pagination-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
    max-width: 100%;
  }

  .previous-page {
    display: flex;
    justify-content: flex-start;
  }

  .next-page {
    display: flex;
    justify-content: flex-end;
  }

  .pagination-link {
    display: flex;
    align-items: center;
    gap: var(--spacing-sm);
    padding: var(--spacing-lg);
    border: 1px solid var(--border-color);
    border-radius: var(--border-radius);
    text-decoration: none;
    color: var(--primary-text-color);
    background-color: var(--background-alt-color);
    transition: all var(--transition-fast);
    max-width: 280px;
    min-height: 80px;
  }

  .pagination-link:hover {
    border-color: var(--nnt-purple);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }

  .pagination-link.previous {
    text-align: left;
  }

  .pagination-link.next {
    text-align: right;
  }

  .arrow {
    font-size: 1.25rem;
    color: var(--nnt-purple);
    font-weight: bold;
    flex-shrink: 0;
  }

  .link-content {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-xxs);
    min-width: 0;
  }

  .link-label {
    font-size: 0.75rem;
    color: var(--alt-text-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .link-title {
    font-size: 0.9rem;
    font-weight: 500;
    color: var(--primary-text-color);
    line-height: 1.3;
    word-break: break-word;
  }

  @media (max-width: 640px) {
    .pagination-container {
      grid-template-columns: 1fr;
      gap: var(--spacing-sm);
    }

    .next-page {
      justify-content: flex-start;
    }

    .pagination-link {
      max-width: 100%;
    }

    .pagination-link.next {
      text-align: left;
    }
  }
}
</style>
