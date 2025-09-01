<template>
  <nav
    class="breadcrumbs"
    aria-label="Breadcrumb"
  >
    <ol class="breadcrumb-list">
      <li class="breadcrumb-item">
        <NuxtLink
          to="/wiki"
          class="breadcrumb-link"
        >
          Wiki
        </NuxtLink>
      </li>

      <li
        v-for="(crumb, index) in breadcrumbs"
        :key="crumb.path"
        class="breadcrumb-item"
      >
        <span
          class="breadcrumb-separator"
          aria-hidden="true"
        >/</span>

        <NuxtLink
          v-if="index < breadcrumbs.length - 1 || !isCurrentPage(crumb.path)"
          :to="crumb.path"
          class="breadcrumb-link"
        >
          {{ crumb.title }}
        </NuxtLink>

        <span
          v-else
          class="breadcrumb-current"
          aria-current="page"
        >
          {{ crumb.title }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
interface Props {
  currentPath: string
  pageTitle?: string
}

const props = defineProps<Props>()

interface Breadcrumb {
  path: string
  title: string
}

const breadcrumbs = computed((): Breadcrumb[] => {
  const pathSegments = props.currentPath.split('/').filter(Boolean)
  const crumbs: Breadcrumb[] = []

  // Skip the first segment if it's 'wiki'
  const wikiSegments = pathSegments.slice(1)

  // Build breadcrumbs from path segments
  let currentPath = '/wiki'

  wikiSegments.forEach((segment, index) => {
    currentPath += `/${segment}`

    // Format title
    let title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')

    // Use page title for the last segment if available
    if (index === wikiSegments.length - 1 && props.pageTitle) {
      title = props.pageTitle
    }

    crumbs.push({
      path: currentPath,
      title,
    })
  })

  return crumbs
})

const isCurrentPage = (path: string): boolean => {
  return path === props.currentPath
}
</script>

<style scoped>
/* Updated to use project CSS variables for unified theming */
.breadcrumbs {
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-sm) 0;
  border-bottom: 1px solid var(--border-color);
}

.breadcrumb-list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: var(--spacing-xs);
}

.breadcrumb-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.breadcrumb-separator {
  color: var(--secondary-text-color);
  font-size: 0.875rem;
}

.breadcrumb-link {
  color: var(--nnt-purple);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color var(--transition-fast);
}

.breadcrumb-link:hover {
  color: var(--nnt-orange);
  text-decoration: underline;
}

.breadcrumb-current {
  color: var(--primary-text-color);
  font-weight: 500;
  font-size: 0.875rem;
}

@media (max-width: 640px) {
  .breadcrumb-list {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xxs);
  }

  .breadcrumb-item {
    width: 100%;
  }

  .breadcrumb-separator {
    display: none;
  }

  .breadcrumb-item:not(:first-child)::before {
    content: "→";
    color: var(--secondary-text-color);
    margin-right: var(--spacing-xs);
  }
}
</style>
