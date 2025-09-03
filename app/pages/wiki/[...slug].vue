<template>
  <div>
    <UPage v-if="page">
      <UPageHeader
        :title="page.title"
        :description="page.description"
      />

      <UPageBody>
        <ContentRenderer
          v-if="page.body"
          :value="page"
        />

        <!-- Show children grid if page has children -->
        <template v-if="children?.length">
          <USeparator color="neutral" />

          <div>
            <h2 class="text-2xl font-semibold mb-4">
              Sections
            </h2>
            <UPageGrid>
              <UPageCard
                v-for="child in children"
                :key="child.path || child.children?.[0]?.path"
                :title="child.title"
                :description="child.description as string"
                :to="child.path || child.children?.[0]?.path"
                :icon="child.icon as string"
              />
            </UPageGrid>
          </div>
        </template>

        <USeparator
          v-if="surround?.length"
          color="neutral"
        />

        <UContentSurround :surround="surround" />
      </UPageBody>

      <template
        v-if="page?.body?.toc?.links?.length"
        #right
      >
        <UContentToc :links="page.body.toc.links" />
      </template>
    </UPage>

    <!-- Development Info -->
    <DevOnly>
      <UCard>
        <template #header>
          <h3>
            Development Info
          </h3>
        </template>

        <div class="space-y-4">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium">Path:</span>
              <UBadge variant="soft">
                {{ $route.path }}
              </UBadge>
            </div>
            <div>
              <span class="font-medium">Has Page:</span>
              <UBadge
                :color="page ? 'success' : 'error'"
                variant="soft"
              >
                {{ !!page }}
              </UBadge>
            </div>
            <div>
              <span class="font-medium">Has Children:</span>
              <UBadge
                :color="children?.length ? 'success' : 'neutral'"
                variant="soft"
              >
                {{ children?.length || 0 }}
              </UBadge>
            </div>
            <div>
              <span class="font-medium">Page Title:</span>
              <UBadge variant="soft">
                {{ pageTitle }}
              </UBadge>
            </div>
          </div>

          <UAccordion :items="debugItems">
            <template #body="{ item }">
              <pre>{{ item.content }}</pre>
            </template>
          </UAccordion>
        </div>
      </UCard>
    </DevOnly>
  </div>
</template>

<script lang="ts" setup>
import type { ContentNavigationItem } from '@nuxt/content'

// Set layout
definePageMeta({
  layout: 'wiki',
})

// Fetch navigation data for the sidebar
const route = useRoute()

// Get navigation from layout
const navigation = inject<ContentNavigationItem[]>('navigation', [])

const { data: page } = await useAsyncData(route.path, () => queryCollection('wiki').path(route.path).first())
if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}

const { data: surround } = await useAsyncData(`${route.path}-surround`, () => {
  return queryCollectionItemSurroundings('wiki', route.path, {
    fields: ['description'],
  })
})

const title = page.value.seo?.title || page.value.title
const description = page.value.seo?.description || page.value.description

useSeoMeta({
  title,
  ogTitle: title,
  description,
  ogDescription: description,
})

// Handle redirects if page has redirect property
if (page.value?.redirect) {
  await navigateTo(page.value.redirect, { redirectCode: 301, replace: true })
}

// Get children for current page
const children = computed(() => {
  if (!navigation.length) return []

  // For the wiki index page, show all top-level sections except the homepage itself
  if (route.path === '/wiki' || route.path === '/wiki/') {
    return navigation.filter(item => item.path !== '/wiki' && item.path !== '/wiki/')
  }

  // For other pages, find their children in the navigation

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

  const currentNavItem = findPageInNavigation(navigation, route.path)
  return currentNavItem?.children || []
})

// Check if current path has children
const hasChildren = computed(() => {
  return children.value && children.value.length > 0
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

// Debug items for development
const debugItems = computed(() => [
  {
    label: 'Page Data',
    content: JSON.stringify(page.value, null, 2),
    defaultOpen: false,
  },
  {
    label: 'Navigation Data',
    content: JSON.stringify(navigation, null, 2),
    defaultOpen: false,
  },
  {
    label: 'Children Data',
    content: JSON.stringify(children.value, null, 2),
    defaultOpen: false,
  },
])

// Set proper status code for 404s
if (import.meta.server && !page.value && !hasChildren.value) {
  setResponseStatus(404)
}
</script>
