<template>
  <li class="toc-item">
    <a
      :href="`#${link.id}`"
      class="toc-link"
      :class="[
        `toc-depth-${link.depth}`,
        { active: isActive },
      ]"
      @click="scrollToHeading"
      @keydown.enter="scrollToHeading"
    >
      {{ link.text }}
    </a>

    <!-- Recursively render children if they exist -->
    <ul
      v-if="link.children && link.children.length > 0"
      class="toc-children"
    >
      <WikiTableOfContentsItem
        v-for="child in link.children"
        :key="child.id"
        :link="child"
      />
    </ul>
  </li>
</template>

<script lang="ts" setup>
interface TocLink {
  id: string
  depth: number
  text: string
  children?: TocLink[]
}

interface Props {
  link: TocLink
}

const props = defineProps<Props>()

// Track which heading is currently visible
const isActive = ref(false)

const scrollToHeading = (event: Event) => {
  event.preventDefault()
  const target = event.target as HTMLAnchorElement
  const href = target.getAttribute('href')

  if (href && href.startsWith('#')) {
    const id = href.substring(1)
    const element = document.getElementById(id)

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })

      // Update URL without triggering navigation
      history.replaceState(null, '', href)
    }
  }
}

// Set up intersection observer to track active headings
onMounted(() => {
  const element = document.getElementById(props.link.id)
  if (!element) {
    console.warn(`Table of contents: Could not find element with ID "${props.link.id}"`)
    return
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.target.id === props.link.id) {
          isActive.value = entry.isIntersecting
        }
      })
    },
    {
      rootMargin: '-20% 0px -70% 0px', // Trigger when heading is in the upper portion of viewport
      threshold: 0,
    },
  )

  observer.observe(element)

  // Cleanup observer on unmount
  onUnmounted(() => {
    observer.disconnect()
  })
})
</script>

<style scoped>
.toc-item {
  list-style: none;
  margin: 0;
}

.toc-link {
  display: block;
  padding: var(--spacing-xs) 0;
  color: var(--secondary-text-color);
  text-decoration: none;
  font-size: 0.85rem;
  line-height: 1.4;
  transition: all var(--transition-fast);
  border-radius: var(--border-radius);
  margin: 0 calc(-1 * var(--spacing-xs));
  padding-left: var(--spacing-xs);
  padding-right: var(--spacing-xs);
}

.toc-link:hover {
  color: var(--nnt-orange);
  background-color: var(--primary-bg-color);
}

.toc-link:focus {
  color: var(--nnt-orange);
  background-color: var(--primary-bg-color);
  outline: 2px solid var(--nnt-orange);
  outline-offset: 2px;
}

/* Depth-specific styling */
.toc-link.toc-depth-2 {
  padding-left: var(--spacing-xs);
  font-weight: 500;
  color: var(--primary-text-color);
}

.toc-link.toc-depth-3 {
  padding-left: var(--spacing-lg);
  font-size: 0.8rem;
  position: relative;
}

.toc-link.toc-depth-3::before {
  content: "▸";
  color: var(--border-color);
  position: absolute;
  left: var(--spacing-sm);
  font-size: 0.7rem;
}

.toc-link.toc-depth-4 {
  padding-left: calc(var(--spacing-lg) + var(--spacing-md));
  font-size: 0.75rem;
  position: relative;
}

.toc-link.toc-depth-4::before {
  content: "▸";
  color: var(--border-color);
  position: absolute;
  left: calc(var(--spacing-lg) + var(--spacing-xs));
  font-size: 0.7rem;
}

.toc-link.toc-depth-5,
.toc-link.toc-depth-6 {
  padding-left: calc(var(--spacing-lg) + var(--spacing-xl));
  font-size: 0.75rem;
  color: var(--secondary-text-color);
  position: relative;
}

.toc-link.toc-depth-5::before,
.toc-link.toc-depth-6::before {
  content: "▸";
  color: var(--border-color);
  position: absolute;
  left: calc(var(--spacing-lg) + var(--spacing-md) + var(--spacing-xs));
  font-size: 0.7rem;
}

/* Active/current heading styling */
.toc-link.active {
  color: var(--nnt-purple);
  background-color: var(--primary-bg-color);
  font-weight: 600;
  border-left: 3px solid var(--nnt-purple);
  padding-left: calc(var(--spacing-xs) - 3px);
}

.toc-link.active::before {
  color: var(--nnt-purple);
}

/* Children container */
.toc-children {
  margin: 0;
  padding: 0;
  border-left: 1px solid var(--border-color);
  margin-left: var(--spacing-xs);
  padding-left: var(--spacing-xs);
  margin-top: var(--spacing-xs);
}

/* Remove border for top-level children */
.toc-item > .toc-children {
  border-left: none;
  margin-left: 0;
  padding-left: 0;
}

/* Hover effects for different depths */
.toc-link.toc-depth-2:hover {
  color: var(--nnt-orange);
}

.toc-link.toc-depth-3:hover::before,
.toc-link.toc-depth-4:hover::before,
.toc-link.toc-depth-5:hover::before,
.toc-link.toc-depth-6:hover::before {
  color: var(--nnt-orange);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .toc-link {
    font-size: 0.8rem;
  }

  .toc-link.toc-depth-3 {
    font-size: 0.75rem;
  }

  .toc-link.toc-depth-4,
  .toc-link.toc-depth-5,
  .toc-link.toc-depth-6 {
    font-size: 0.7rem;
  }
}
</style>
