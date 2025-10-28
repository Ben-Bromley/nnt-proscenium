<template>
  <div class="foh-performances">
    <header class="foh-performances__header">
      <div>
        <h1 class="foh-performances__title">
          Today's Performances
        </h1>
        <div class="foh-performances__subtitle">
          {{ formatDate(new Date()) }}
        </div>
      </div>

      <UButton
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        @click="navigateTo('/admin/foh')"
      >
        Back to Dashboard
      </UButton>
    </header>

    <UAlert
      v-if="error"
      icon="i-lucide-alert-circle"
      color="error"
      variant="soft"
      :title="error"
      class="mb-6"
    />

    <LoadingSpinner v-else-if="pending" />

    <div
      v-else-if="data?.data"
      class="foh-performances__content"
    >
      <div
        v-if="data.data.performances.length === 0"
        class="empty-state"
      >
        <UIcon
          name="i-lucide-calendar-x"
          class="empty-state__icon"
        />
        <h2 class="empty-state__title">
          No Performances Today
        </h2>
        <p class="empty-state__text">
          There are no performances scheduled for today.
        </p>
      </div>

      <div
        v-else
        class="performances-grid"
      >
        <UCard
          v-for="performance in data.data.performances"
          :key="performance.id"
          class="performance-card"
        >
          <template #header>
            <div class="performance-card__header">
              <div>
                <h3 class="performance-card__show">
                  {{ performance.show?.title || 'Unknown Show' }}
                </h3>
                <div class="performance-card__time">
                  <UIcon name="i-lucide-clock" />
                  {{ formatTime(performance.startDateTime) }}
                  <span v-if="performance.endDateTime">
                    - {{ formatTime(performance.endDateTime) }}
                  </span>
                </div>
              </div>
              <UBadge
                :color="getStatusColor(performance.status) as any"
                variant="soft"
                size="lg"
              >
                {{ performance.status }}
              </UBadge>
            </div>
          </template>

          <!-- Venue & Capacity -->
          <div class="performance-card__section">
            <div class="info-row">
              <div class="info-label">
                <UIcon name="i-lucide-map-pin" />
                Venue
              </div>
              <div class="info-value">
                {{ performance.venue?.name || 'Unknown Venue' }}
              </div>
            </div>

            <div class="info-row">
              <div class="info-label">
                <UIcon name="i-lucide-users" />
                Capacity
              </div>
              <div class="info-value">
                {{ performance.reservationSummary.totalTicketsReserved }} / {{ performance.maxCapacity }}
                <span class="capacity-percentage">
                  ({{ calculatePercentage(performance.reservationSummary.totalTicketsReserved, performance.maxCapacity) }}%)
                </span>
              </div>
            </div>
          </div>

          <!-- Capacity Bar -->
          <div class="capacity-bar">
            <div
              class="capacity-bar__fill"
              :style="{ width: `${calculatePercentage(performance.reservationSummary.totalTicketsReserved, performance.maxCapacity)}%` }"
              :class="getCapacityColor(calculatePercentage(performance.reservationSummary.totalTicketsReserved, performance.maxCapacity))"
            />
          </div>

          <!-- Reservation Stats -->
          <div class="performance-card__section">
            <h4 class="section-title">
              Reservation Summary
            </h4>

            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value stat-value--blue">
                  {{ performance.reservationSummary.totalReservations }}
                </div>
                <div class="stat-label">
                  Total
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-value stat-value--yellow">
                  {{ performance.reservationSummary.pendingCollection }}
                </div>
                <div class="stat-label">
                  Pending
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-value stat-value--green">
                  {{ performance.reservationSummary.collected }}
                </div>
                <div class="stat-label">
                  Collected
                </div>
              </div>

              <div class="stat-item">
                <div class="stat-value stat-value--red">
                  {{ performance.reservationSummary.cancelled }}
                </div>
                <div class="stat-label">
                  Cancelled
                </div>
              </div>
            </div>
          </div>

          <!-- Revenue -->
          <div class="performance-card__section">
            <div class="revenue-row">
              <div class="revenue-item">
                <div class="revenue-label">
                  Tickets Reserved
                </div>
                <div class="revenue-value">
                  {{ performance.reservationSummary.totalTicketsReserved }} tickets
                </div>
              </div>

              <div class="revenue-item">
                <div class="revenue-label">
                  Utilization
                </div>
                <div class="revenue-value revenue-value--success">
                  {{ performance.reservationSummary.utilizationPercentage }}%
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <template #footer>
            <div class="performance-card__actions">
              <UButton
                icon="i-lucide-eye"
                color="neutral"
                variant="ghost"
                @click="navigateTo(`/admin/performances/${performance.id}`)"
              >
                View Details
              </UButton>

              <UButton
                icon="i-lucide-ticket"
                color="primary"
                @click="navigateTo(`/admin/foh/reservations?performance=${performance.id}`)"
              >
                Manage Reservations
              </UButton>
            </div>
          </template>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role-redirect'],
  layout: 'admin',
  title: 'Today\'s Performances',
})

// Fetch today's performances
const { data, pending, error: fetchError } = await useFetch(
  '/api/foh/performances/today',
  {
    key: 'foh-performances-today',
  },
)

const error = ref<string | null>(null)

watchEffect(() => {
  if (fetchError.value) {
    error.value = fetchError.value.statusMessage || 'Failed to load performances'
  }
  else {
    error.value = null
  }
})

// Formatting helpers
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date)
}

function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function calculatePercentage(reserved: number, capacity: number): number {
  if (capacity === 0)
    return 0
  return Math.round((reserved / capacity) * 100)
}

// Status helpers
function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    SCHEDULED: 'blue',
    CANCELLED: 'red',
    COMPLETED: 'gray',
  }
  return colorMap[status] || 'gray'
}

function getCapacityColor(percentage: number): string {
  if (percentage >= 90)
    return 'capacity-critical'
  if (percentage >= 70)
    return 'capacity-high'
  if (percentage >= 40)
    return 'capacity-medium'
  return 'capacity-low'
}
</script>

<style scoped>
.foh-performances {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.foh-performances__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.foh-performances__title {
  font-size: 28px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0 0 4px 0;
}

.foh-performances__subtitle {
  font-size: 16px;
  color: var(--secondary-text-color);
}

.empty-state {
  text-align: center;
  padding: 80px 24px;
  background: var(--surface-color);
  border-radius: 12px;
}

.empty-state__icon {
  font-size: 64px;
  color: var(--secondary-text-color);
  opacity: 0.3;
  margin-bottom: 16px;
}

.empty-state__title {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0 0 8px 0;
}

.empty-state__text {
  font-size: 14px;
  color: var(--secondary-text-color);
  margin: 0;
}

.performances-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
  gap: 24px;
}

.performance-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.performance-card__show {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0 0 8px 0;
}

.performance-card__time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: var(--secondary-text-color);
}

.performance-card__section {
  padding: 16px 0;
  border-top: 1px solid var(--border-color);
}

.performance-card__section:first-of-type {
  padding-top: 0;
  border-top: none;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 500;
  color: var(--secondary-text-color);
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text-color);
}

.capacity-percentage {
  font-size: 12px;
  color: var(--secondary-text-color);
  font-weight: 400;
}

.capacity-bar {
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  margin: 16px 0;
}

.capacity-bar__fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.capacity-low {
  background: rgb(34, 197, 94);
}

.capacity-medium {
  background: rgb(234, 179, 8);
}

.capacity-high {
  background: rgb(249, 115, 22);
}

.capacity-critical {
  background: rgb(239, 68, 68);
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-value--blue {
  color: rgb(59, 130, 246);
}

.stat-value--yellow {
  color: rgb(234, 179, 8);
}

.stat-value--green {
  color: rgb(34, 197, 94);
}

.stat-value--red {
  color: rgb(239, 68, 68);
}

.stat-label {
  font-size: 12px;
  color: var(--secondary-text-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.revenue-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.revenue-item {
  text-align: center;
  padding: 12px;
  background: var(--hover-color);
  border-radius: 8px;
}

.revenue-label {
  font-size: 12px;
  color: var(--secondary-text-color);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.revenue-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary-text-color);
}

.revenue-value--success {
  color: rgb(34, 197, 94);
}

.performance-card__actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

@media (max-width: 1024px) {
  .performances-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .foh-performances {
    padding: 16px;
  }

  .foh-performances__header {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .revenue-row {
    grid-template-columns: 1fr;
  }

  .performance-card__actions {
    flex-direction: column;
  }
}
</style>
