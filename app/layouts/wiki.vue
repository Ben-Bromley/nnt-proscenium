<template>
  <UContainer>
    <UPage>
      <template #left>
        <UPageAside v-if="navigation">
          <!-- <template #top>
            <UContentSearchButton :collapsed="false" />
          </template> -->

          <UContentNavigation
            :navigation="navigation"
            type="multiple"
            highlight
          >
            <!-- Custom link template that makes category headers clickable -->
            <template #link="{ link, active }">
              <component
                :is="link.children?.length ? 'div' : 'span'"
                class="flex items-center w-full"
              >
                <!-- Make category headers clickable -->
                <ULink
                  v-if="link.children?.length && link.path"
                  :to="link.path"
                  class="flex-1 flex items-center min-w-0 mr-2"
                  :class="{ 'font-semibold text-primary-500': active }"
                >
                  <UIcon
                    v-if="link.icon"
                    :name="link.icon"
                    class="w-4 h-4 mr-2 flex-shrink-0"
                  />
                  <span class="truncate">{{ link.title }}</span>
                </ULink>

                <!-- Regular link for pages without children -->
                <template v-else>
                  <UIcon
                    v-if="link.icon"
                    :name="link.icon"
                    class="w-4 h-4 mr-2 flex-shrink-0"
                  />
                  <span class="truncate">{{ link.title }}</span>
                </template>

                <!-- Badge and chevron for categories -->
                <span
                  v-if="link.children?.length"
                  class="flex items-center flex-shrink-0 ml-auto"
                >
                  <UBadge
                    v-if="link.badge"
                    v-bind="typeof link.badge === 'object' ? link.badge : { label: link.badge }"
                  />
                  <UIcon
                    name="i-heroicons-chevron-down"
                    class="w-4 h-4 ml-1"
                  />
                </span>

                <!-- Badge and trailing icon for regular links -->
                <span
                  v-else-if="link.badge || link.trailingIcon"
                  class="flex items-center flex-shrink-0 ml-auto"
                >
                  <UBadge
                    v-if="link.badge"
                    v-bind="typeof link.badge === 'object' ? link.badge : { label: link.badge }"
                  />
                  <UIcon
                    v-if="link.trailingIcon"
                    :name="link.trailingIcon"
                    class="w-4 h-4 ml-1"
                  />
                </span>
              </component>
            </template>
          </UContentNavigation>
        </UPageAside>
      </template>

      <slot />
    </UPage>
  </UContainer>
</template>

<script lang="ts" setup>
import type { ContentNavigationItem } from '@nuxt/content'

const { data: rawNavigation } = await useAsyncData('wiki-navigation', () => queryCollectionNavigation('wiki'))

// Process navigation to remove redundant children
function processNavigation(items: ContentNavigationItem[]): ContentNavigationItem[] {
  return items.map((item) => {
    if (!item.children?.length) {
      return item
    }

    // Create a copy to avoid mutating original data
    const processedItem = { ...item }

    // Process children recursively first
    processedItem.children = processNavigation(item.children)

    // Find children that have the same path as the parent
    const duplicateChild = processedItem.children.find((child: ContentNavigationItem) => child.path === item.path)

    if (duplicateChild) {
      // Remove the duplicate child
      processedItem.children = processedItem.children.filter((child: ContentNavigationItem) => child.path !== item.path)
    }

    // If this category has no actual page (page: false), remove the path to make it non-clickable
    if (item.page === false) {
      processedItem.path = ''
    }

    // If no children remain, remove the children array
    if (processedItem.children.length === 0) {
      delete processedItem.children
    }

    return processedItem
  })
}

const navigation = processNavigation(rawNavigation.value?.[0]?.children || [])

provide('navigation', navigation)
</script>
