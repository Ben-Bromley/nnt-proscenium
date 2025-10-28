<template>
  <div class="whats-on">
    <UPageHero
      title="What's On"
      description="Discover our upcoming shows and events"
    />

    <UContainer class="py-12">
      <LoadingSpinner v-if="pending" />

      <UAlert
        v-else-if="error"
        icon="i-lucide-alert-circle"
        color="error"
        variant="soft"
        :title="error"
        class="mb-6"
      />

      <div
        v-else-if="shows && shows.length === 0"
        class="empty-state"
      >
        <UIcon
          name="i-lucide-calendar-x"
          class="empty-state__icon"
        />
        <h2 class="empty-state__title">
          No Upcoming Shows
        </h2>
        <p class="empty-state__text">
          There are currently no upcoming shows or events. Please check back after our season launch!
        </p>
      </div>

      <div
        v-else
        class="shows-grid"
      >
        <UCard
          v-for="show in shows"
          :key="show.id"
          class="show-card"
        >
          <template
            v-if="show.posterImageUrl"
            #header
          >
            <img
              :src="show.posterImageUrl"
              :alt="show.title"
              class="show-poster"
            >
          </template>

          <div class="show-content">
            <div class="show-header">
              <h3 class="show-title">
                {{ show.title }}
              </h3>
              <UBadge
                :color="getShowTypeColor(show.showType)"
                variant="soft"
                size="sm"
              >
                {{ formatShowType(show.showType) }}
              </UBadge>
            </div>

            <p
              v-if="show.description"
              class="show-description"
            >
              {{ truncateDescription(show.description) }}
            </p>

            <div
              v-if="show.ageRating"
              class="show-meta"
            >
              <UIcon name="i-lucide-info" />
              <span>{{ show.ageRating }}</span>
            </div>

            <div
              v-if="show.performances && show.performances.length > 0"
              class="performances-preview"
            >
              <div class="performance-count">
                <UIcon name="i-lucide-calendar" />
                <span>{{ show.performances.length }} {{ show.performances.length === 1 ? 'performance' : 'performances' }}</span>
              </div>
              <div class="next-performance">
                <UIcon name="i-lucide-clock" />
                <span>{{ formatPerformanceDate(show.performances[0]?.startDateTime) }}</span>
              </div>
            </div>
          </div>

          <template #footer>
            <div class="show-actions">
              <UButton
                :to="`/shows/${show.slug}`"
                color="primary"
                block
              >
                View Details & Book
              </UButton>
            </div>
          </template>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  title: 'What\'s On',
})

// Fetch upcoming shows
const { data: showsData, pending, error: fetchError } = await useFetch(
  '/api/shows',
  {
    query: {
      includeUpcoming: 'true',
      includePast: 'false',
      limit: 50,
    },
  },
)

const error = ref<string | null>(null)
const shows = computed(() => {
  // Access the array directly - the API returns an array, not an object with a shows property
  const data = showsData.value?.data
  return Array.isArray(data) ? data : []
})

watchEffect(() => {
  if (fetchError.value) {
    error.value = fetchError.value.statusMessage || 'Failed to load shows'
  }
  else {
    error.value = null
  }
})

// Helper functions
function formatShowType(showType: string): string {
  return showType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function getShowTypeColor(showType: string): 'primary' | 'secondary' | 'warning' | 'neutral' | 'info' {
  const colorMap: Record<string, 'primary' | 'secondary' | 'warning' | 'neutral' | 'info'> = {
    IN_HOUSE: 'primary',
    STUDIO: 'secondary',
    FESTIVAL: 'warning',
    EXTERNAL_HIRE: 'neutral',
    WORKSHOP: 'info',
    OTHER: 'neutral',
  }
  return colorMap[showType] || 'neutral'
}

function truncateDescription(description: string, maxLength = 150): string {
  if (description.length <= maxLength)
    return description
  return `${description.substring(0, maxLength)}...`
}

function formatPerformanceDate(dateString: string | undefined): string {
  if (!dateString)
    return 'TBA'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
</script>

<style scoped>
.whats-on {
  min-height: 100vh;
}

.empty-state {
  text-align: center;
  padding: 80px 24px;
}

.empty-state__icon {
  font-size: 64px;
  color: var(--secondary-text-color);
  opacity: 0.3;
  margin-bottom: 16px;
}

.empty-state__title {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0 0 12px 0;
}

.empty-state__text {
  font-size: 16px;
  color: var(--secondary-text-color);
  margin: 0;
}

.shows-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
}

.show-card {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.show-poster {
  width: 100%;
  height: 240px;
  object-fit: cover;
}

.show-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.show-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.show-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0;
  flex: 1;
}

.show-description {
  font-size: 14px;
  line-height: 1.6;
  color: var(--secondary-text-color);
  margin: 0;
}

.show-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--secondary-text-color);
  padding: 8px 12px;
  background: var(--hover-color);
  border-radius: 6px;
}

.performances-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
}

.performance-count,
.next-performance {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--secondary-text-color);
}

.show-actions {
  margin-top: auto;
}

@media (max-width: 768px) {
  .shows-grid {
    grid-template-columns: 1fr;
  }
}
</style>
