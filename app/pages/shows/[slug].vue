<template>
  <div class="show-detail">
    <LoadingSpinner v-if="pending" />

    <UAlert
      v-else-if="error"
      icon="i-lucide-alert-circle"
      color="error"
      variant="soft"
      :title="error"
      class="mb-6"
    />

    <template v-else-if="show">
      <!-- Show Hero -->
      <div class="show-hero">
        <div
          v-if="show.posterImageUrl"
          class="hero-image"
          :style="{ backgroundImage: `url(${show.posterImageUrl})` }"
        />
        <UContainer class="hero-content">
          <div class="hero-text">
            <UBadge
              :color="getShowTypeColor(show.showType)"
              variant="soft"
              size="lg"
              class="mb-4"
            >
              {{ formatShowType(show.showType) }}
            </UBadge>
            <h1 class="hero-title">
              {{ show.title }}
            </h1>
            <p
              v-if="show.ageRating"
              class="hero-rating"
            >
              <UIcon name="i-lucide-info" />
              {{ show.ageRating }}
            </p>
          </div>
        </UContainer>
      </div>

      <!-- Show Content -->
      <UContainer class="py-12">
        <div class="content-grid">
          <!-- Main Content -->
          <div class="main-content">
            <!-- Description -->
            <section
              v-if="show.description"
              class="content-section"
            >
              <h2 class="section-title">
                About This Show
              </h2>
              <p class="description-text">
                {{ show.description }}
              </p>
            </section>

            <!-- Induction (if present) -->
            <!-- <section
              v-if="show.induction"
              class="content-section"
            >
              <h2 class="section-title">
                Induction Information
              </h2>
              <p class="description-text">
                {{ show.induction }}
              </p>
            </section> -->

            <!-- Content Warnings -->
            <section
              v-if="show.contentWarnings && show.contentWarnings.length > 0"
              class="content-section"
            >
              <h2 class="section-title">
                Content Warnings
              </h2>
              <div class="warnings-list">
                <UBadge
                  v-for="(warning, index) in show.contentWarnings"
                  :key="index"
                  color="warning"
                  variant="soft"
                >
                  {{ warning.contentWarning?.name || 'Warning' }}
                </UBadge>
              </div>
            </section>

            <!-- Performances -->
            <section
              v-if="show.performances && show.performances.length > 0"
              class="content-section"
            >
              <h2 class="section-title">
                Performances
              </h2>
              <div class="performances-list">
                <UCard
                  v-for="performance in show.performances"
                  :key="performance.id"
                  class="performance-card"
                >
                  <div class="performance-content">
                    <div class="performance-info">
                      <h3 class="performance-title">
                        {{ performance.title || show.title }}
                      </h3>
                      <div class="performance-meta">
                        <div class="meta-item">
                          <UIcon name="i-lucide-calendar" />
                          <span>{{ formatPerformanceDate(performance.startDateTime) }}</span>
                        </div>
                        <div class="meta-item">
                          <UIcon name="i-lucide-clock" />
                          <span>{{ formatPerformanceTime(performance.startDateTime, performance.endDateTime) }}</span>
                        </div>
                        <div
                          v-if="performance.venue"
                          class="meta-item"
                        >
                          <UIcon name="i-lucide-map-pin" />
                          <span>{{ performance.venue.name }}</span>
                        </div>
                      </div>

                      <!-- Capacity Info -->
                      <div class="capacity-info">
                        <div class="capacity-bar">
                          <div
                            class="capacity-fill"
                            :style="{ width: `${getCapacityPercentage(performance)}%` }"
                            :class="getCapacityClass(performance)"
                          />
                        </div>
                        <span class="capacity-text">
                          {{ getAvailableSeats(performance) }} seats available
                        </span>
                      </div>
                    </div>

                    <div class="performance-actions">
                      <!-- External Booking Link -->
                      <UButton
                        v-if="performance.externalBookingLink"
                        :to="performance.externalBookingLink"
                        target="_blank"
                        color="primary"
                        block
                      >
                        Book External
                        <UIcon name="i-lucide-external-link" />
                      </UButton>

                      <!-- Internal Booking -->
                      <UButton
                        v-else-if="canBook(performance)"
                        :to="`/reservation/new?performanceId=${performance.id}`"
                        color="primary"
                        block
                      >
                        Reserve Tickets
                        <UIcon name="i-lucide-ticket" />
                      </UButton>

                      <!-- Not Available -->
                      <UButton
                        v-else
                        disabled
                        color="neutral"
                        block
                      >
                        {{ getUnavailableReason(performance) }}
                      </UButton>
                    </div>
                  </div>
                </UCard>
              </div>
            </section>
          </div>

          <!-- Sidebar -->
          <aside class="sidebar">
            <!-- Ticket Prices (if available) -->
            <UCard
              v-if="(show as any).showTicketPrices && (show as any).showTicketPrices.length > 0"
              class="sidebar-card"
            >
              <template #header>
                <h3 class="sidebar-title">
                  Ticket Prices
                </h3>
              </template>
              <div class="price-list">
                <div
                  v-for="price in (show as any).showTicketPrices"
                  :key="price.id"
                  class="price-item"
                >
                  <span class="price-label">{{ price.ticketType.name }}</span>
                  <span class="price-value">£{{ price.price.toFixed(2) }}</span>
                </div>
              </div>
            </UCard>

            <!-- Quick Info -->
            <UCard class="sidebar-card">
              <template #header>
                <h3 class="sidebar-title">
                  Quick Info
                </h3>
              </template>
              <div class="info-list">
                <div class="info-item">
                  <span class="info-label">Show Type</span>
                  <UBadge
                    :color="getShowTypeColor(show.showType)"
                    variant="soft"
                    size="sm"
                  >
                    {{ formatShowType(show.showType) }}
                  </UBadge>
                </div>
                <div
                  v-if="show.ageRating"
                  class="info-item"
                >
                  <span class="info-label">Age Rating</span>
                  <span class="info-value">{{ show.ageRating }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Performances</span>
                  <span class="info-value">{{ show.performances?.length || 0 }}</span>
                </div>
              </div>
            </UCard>
          </aside>
        </div>
      </UContainer>
    </template>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const slug = route.params.slug as string

definePageMeta({
  layout: 'default',
})

// Fetch show data
const { data: showData, pending, error: fetchError } = await useFetch(
  `/api/v1/shows/${slug}`,
)

const error = ref<string | null>(null)
const show = computed(() => showData.value?.data)

watchEffect(() => {
  if (fetchError.value) {
    error.value = fetchError.value.statusMessage || 'Failed to load show details'
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

function formatPerformanceDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatPerformanceTime(startString: string, endString: string): string {
  const start = new Date(startString)
  const end = new Date(endString)
  const startTime = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(start)
  const endTime = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(end)
  return `${startTime} - ${endTime}`
}

interface Performance {
  id: string
  maxCapacity: number
  reservationsOpen: boolean
  externalBookingLink?: string | null
  startDateTime: string
  _count?: {
    reservations: number
  }
}

function getCapacityPercentage(performance: Performance): number {
  const reserved = performance._count?.reservations || 0
  return (reserved / performance.maxCapacity) * 100
}

function getCapacityClass(performance: Performance): string {
  const percentage = getCapacityPercentage(performance)
  if (percentage >= 90)
    return 'capacity-critical'
  if (percentage >= 70)
    return 'capacity-high'
  return 'capacity-low'
}

function getAvailableSeats(performance: Performance): number {
  const reserved = performance._count?.reservations || 0
  return Math.max(0, performance.maxCapacity - reserved)
}

function canBook(performance: Performance): boolean {
  // Check if reservations are open
  if (!performance.reservationsOpen)
    return false

  // Check if there's an external booking link (handled separately)
  if (performance.externalBookingLink)
    return false

  // Check if performance is in the future
  const now = new Date()
  const performanceDate = new Date(performance.startDateTime)
  if (performanceDate <= now)
    return false

  // Check if seats are available
  const available = getAvailableSeats(performance)
  return available > 0
}

function getUnavailableReason(performance: Performance): string {
  if (!performance.reservationsOpen)
    return 'Booking Not Available'

  const now = new Date()
  const performanceDate = new Date(performance.startDateTime)
  if (performanceDate <= now)
    return 'Performance Has Passed'

  const available = getAvailableSeats(performance)
  if (available <= 0)
    return 'Sold Out'

  return 'Unavailable'
}
</script>

<style scoped>
.show-detail {
  min-height: 100vh;
}

.show-hero {
  position: relative;
  background: linear-gradient(to bottom, var(--surface-color), var(--background-color));
  overflow: hidden;
}

.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-size: cover;
  background-position: center;
  opacity: 0.2;
  z-index: 0;
}

.hero-content {
  position: relative;
  z-index: 1;
  padding: 80px 24px 60px;
}

.hero-text {
  max-width: 800px;
}

.hero-title {
  font-size: 48px;
  font-weight: 700;
  color: var(--primary-text-color);
  margin: 0 0 16px 0;
  line-height: 1.2;
}

.hero-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: var(--secondary-text-color);
  margin: 0;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 40px;
}

.main-content {
  min-width: 0;
}

.content-section {
  margin-bottom: 48px;
}

.content-section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0 0 20px 0;
}

.description-text {
  font-size: 16px;
  line-height: 1.8;
  color: var(--secondary-text-color);
  margin: 0;
  white-space: pre-wrap;
}

.warnings-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.performances-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.performance-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.performance-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.performance-content {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.performance-info {
  flex: 1;
  min-width: 0;
}

.performance-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0 0 12px 0;
}

.performance-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--secondary-text-color);
}

.capacity-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.capacity-bar {
  height: 8px;
  background: var(--hover-color);
  border-radius: 4px;
  overflow: hidden;
}

.capacity-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.capacity-fill.capacity-low {
  background: var(--success-color, #10b981);
}

.capacity-fill.capacity-high {
  background: var(--warning-color, #f59e0b);
}

.capacity-fill.capacity-critical {
  background: var(--error-color, #ef4444);
}

.capacity-text {
  font-size: 13px;
  color: var(--secondary-text-color);
}

.performance-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 180px;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.sidebar-card {
  position: sticky;
  top: 24px;
}

.sidebar-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0;
}

.price-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
}

.price-item:last-child {
  border-bottom: none;
}

.price-label {
  font-size: 14px;
  color: var(--secondary-text-color);
}

.price-value {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-text-color);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 14px;
  color: var(--secondary-text-color);
}

.info-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--primary-text-color);
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .sidebar {
    order: -1;
  }

  .sidebar-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 32px;
  }

  .performance-content {
    flex-direction: column;
  }

  .performance-actions {
    width: 100%;
  }
}
</style>
