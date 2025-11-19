<template>
  <div class="foh-dashboard">
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
      v-else-if="dashboard?.data"
      class="foh-dashboard__content"
    >
      <!-- Header -->
      <header class="foh-dashboard__header">
        <div>
          <h1 class="foh-dashboard__title">
            Front of House Dashboard
          </h1>
          <div class="foh-dashboard__subtitle">
            {{ formatDate(new Date()) }}
          </div>
        </div>

        <div class="foh-dashboard__quick-actions">
          <UButton
            icon="i-lucide-ticket"
            color="primary"
            size="lg"
            @click="navigateTo('/admin/foh/reservations')"
          >
            Collect Tickets
          </UButton>
          <UButton
            icon="i-lucide-user-plus"
            color="secondary"
            variant="outline"
            size="lg"
            @click="navigateTo('/admin/foh/customers')"
          >
            Walk-in Sale
          </UButton>
        </div>
      </header>

      <!-- Stats Cards -->
      <div class="foh-dashboard__stats">
        <UCard>
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--blue">
              <UIcon name="i-lucide-calendar-check" />
            </div>
            <div class="stat-card__content">
              <div class="stat-card__label">
                Today's Performances
              </div>
              <div class="stat-card__value">
                {{ dashboard.data.todaysPerformances.length }}
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--yellow">
              <UIcon name="i-lucide-clipboard-list" />
            </div>
            <div class="stat-card__content">
              <div class="stat-card__label">
                Total Reservations
              </div>
              <div class="stat-card__value">
                {{ dashboard.data.totalReservations }}
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--orange">
              <UIcon name="i-lucide-clock" />
            </div>
            <div class="stat-card__content">
              <div class="stat-card__label">
                Pending Collection
              </div>
              <div class="stat-card__value">
                {{ dashboard.data.pendingCollections }}
              </div>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--green">
              <UIcon name="i-lucide-pound-sterling" />
            </div>
            <div class="stat-card__content">
              <div class="stat-card__label">
                Total Revenue
              </div>
              <div class="stat-card__value">
                £{{ formatPrice(dashboard.data.totalRevenue) }}
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Main Content Grid -->
      <div class="foh-dashboard__grid">
        <!-- Today's Performances -->
        <UCard class="full-width">
          <template #header>
            <div class="card-header">
              <div class="card-header__left">
                <UIcon
                  name="i-lucide-calendar"
                  class="card-header__icon"
                />
                <h2 class="card-header__title">
                  Today's Performances
                </h2>
              </div>
              <UButton
                icon="i-lucide-arrow-right"
                color="neutral"
                variant="ghost"
                size="sm"
                @click="navigateTo('/admin/foh/performances')"
              >
                View All
              </UButton>
            </div>
          </template>

          <div
            v-if="dashboard.data.todaysPerformances.length === 0"
            class="empty-state"
          >
            <UIcon
              name="i-lucide-calendar-x"
              class="empty-state__icon"
            />
            <p class="empty-state__text">
              No performances scheduled for today
            </p>
          </div>

          <div
            v-else
            class="performances-list"
          >
            <div
              v-for="performance in dashboard.data.todaysPerformances"
              :key="performance.id"
              class="performance-item"
              @click="navigateTo(`/admin/performances/${performance.id}`)"
            >
              <div class="performance-item__time">
                {{ formatTime(performance.startDateTime) }}
              </div>
              <div class="performance-item__details">
                <div class="performance-item__title">
                  {{ performance.show?.title }}
                </div>
                <div class="performance-item__venue">
                  {{ performance.venue?.name }}
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Venue Capacity Utilization -->
        <UCard>
          <template #header>
            <div class="card-header">
              <UIcon
                name="i-lucide-pie-chart"
                class="card-header__icon"
              />
              <h2 class="card-header__title">
                Capacity Utilization
              </h2>
            </div>
          </template>

          <div
            v-if="dashboard.data.venueCapacityUtilization.length === 0"
            class="empty-state"
          >
            <UIcon
              name="i-lucide-bar-chart"
              class="empty-state__icon"
            />
            <p class="empty-state__text">
              No data available
            </p>
          </div>

          <div
            v-else
            class="utilization-list"
          >
            <div
              v-for="util in dashboard.data.venueCapacityUtilization"
              :key="util.performanceId"
              class="utilization-item"
            >
              <div class="utilization-item__header">
                <div class="utilization-item__title">
                  {{ util.showTitle }}
                </div>
                <div class="utilization-item__percentage">
                  {{ util.utilizationPercentage }}%
                </div>
              </div>
              <div class="utilization-item__subtitle">
                {{ util.venueName }}
              </div>
              <div class="utilization-item__bar">
                <div
                  class="utilization-item__fill"
                  :style="{ width: `${util.utilizationPercentage}%` }"
                  :class="getUtilizationColor(util.utilizationPercentage)"
                />
              </div>
              <div class="utilization-item__stats">
                {{ util.reservedTickets }} / {{ util.totalCapacity }} seats
              </div>
            </div>
          </div>
        </UCard>

        <!-- Recent Activity -->
        <UCard>
          <template #header>
            <div class="card-header">
              <UIcon
                name="i-lucide-activity"
                class="card-header__icon"
              />
              <h2 class="card-header__title">
                Recent Activity
              </h2>
            </div>
          </template>

          <div
            v-if="dashboard.data.recentActivity.length === 0"
            class="empty-state"
          >
            <UIcon
              name="i-lucide-inbox"
              class="empty-state__icon"
            />
            <p class="empty-state__text">
              No recent activity
            </p>
          </div>

          <div
            v-else
            class="activity-list"
          >
            <div
              v-for="activity in dashboard.data.recentActivity"
              :key="activity.id"
              class="activity-item"
            >
              <div
                class="activity-item__icon"
                :class="`activity-item__icon--${getActivityColor(activity.type)}`"
              >
                <UIcon :name="getActivityIcon(activity.type)" />
              </div>
              <div class="activity-item__content">
                <div class="activity-item__title">
                  {{ getActivityTitle(activity) }}
                </div>
                <div class="activity-item__time">
                  {{ formatRelativeTime(activity.timestamp) }}
                </div>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role-redirect'],
  layout: 'admin',
  title: 'FoH Dashboard',
})

const { formatDateTime } = useFormatters()

// Fetch dashboard data
const { data: dashboard, pending, error: fetchError } = await useFetch(
  '/api/v1/foh/dashboard',
  {
    key: 'foh-dashboard',
  },
)

const error = ref<string | null>(null)

watchEffect(() => {
  if (fetchError.value) {
    error.value = fetchError.value.statusMessage || 'Failed to load dashboard'
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

function formatPrice(pence: number): string {
  return (pence / 100).toFixed(2)
}

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1)
    return 'Just now'
  if (diffMins < 60)
    return `${diffMins} min ago`
  if (diffMins < 1440)
    return `${Math.floor(diffMins / 60)} hours ago`
  return formatDateTime(timestamp)
}

// Status helpers
function getStatusColor(status: string): 'info' | 'error' | 'success' | 'neutral' {
  const colorMap: Record<string, 'info' | 'error' | 'success' | 'neutral'> = {
    SCHEDULED: 'info',
    CANCELLED: 'error',
    COMPLETED: 'success',
  }
  return colorMap[status] || 'neutral'
}

function getUtilizationColor(percentage: number): string {
  if (percentage >= 90)
    return 'utilization-critical'
  if (percentage >= 70)
    return 'utilization-high'
  if (percentage >= 40)
    return 'utilization-medium'
  return 'utilization-low'
}

function getActivityColor(type: string): string {
  const colorMap: Record<string, string> = {
    reservation_created: 'blue',
    tickets_collected: 'green',
    reservation_cancelled: 'red',
  }
  return colorMap[type] || 'gray'
}

function getActivityIcon(type: string): string {
  const iconMap: Record<string, string> = {
    reservation_created: 'i-lucide-plus-circle',
    tickets_collected: 'i-lucide-check-circle',
    reservation_cancelled: 'i-lucide-x-circle',
  }
  return iconMap[type] || 'i-lucide-circle'
}

function getActivityTitle(activity: any): string {
  const { type, customerName, showTitle, reservationCode } = activity

  if (type === 'reservation_created') {
    return `${customerName} reserved tickets for ${showTitle} (${reservationCode})`
  }
  if (type === 'tickets_collected') {
    return `${customerName} collected tickets for ${showTitle} (${reservationCode})`
  }
  if (type === 'reservation_cancelled') {
    return `Reservation ${reservationCode} cancelled for ${showTitle}`
  }
  return 'Unknown activity'
}
</script>

<style scoped>
.foh-dashboard {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.foh-dashboard__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.foh-dashboard__title {
  font-size: 28px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0 0 4px 0;
}

.foh-dashboard__subtitle {
  font-size: 16px;
  color: var(--secondary-text-color);
}

.foh-dashboard__quick-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.foh-dashboard__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-card__icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.stat-card__icon--blue {
  background: rgba(59, 130, 246, 0.1);
  color: rgb(59, 130, 246);
}

.stat-card__icon--yellow {
  background: rgba(234, 179, 8, 0.1);
  color: rgb(234, 179, 8);
}

.stat-card__icon--orange {
  background: rgba(249, 115, 22, 0.1);
  color: rgb(249, 115, 22);
}

.stat-card__icon--green {
  background: rgba(34, 197, 94, 0.1);
  color: rgb(34, 197, 94);
}

.stat-card__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--secondary-text-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-card__value {
  font-size: 28px;
  font-weight: 700;
  color: var(--primary-text-color);
  line-height: 1.2;
}

.foh-dashboard__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 24px;
}

.full-width {
  grid-column: 1 / -1;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header__left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-header__icon {
  font-size: 20px;
  color: var(--primary-color);
}

.card-header__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0;
}

.empty-state {
  text-align: center;
  padding: 48px 24px;
}

.empty-state__icon {
  font-size: 48px;
  color: var(--secondary-text-color);
  opacity: 0.3;
  margin-bottom: 12px;
}

.empty-state__text {
  font-size: 14px;
  color: var(--secondary-text-color);
  margin: 0;
}

.performances-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.performance-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background: var(--surface-color);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s;
}

.performance-item:hover {
  border-color: var(--primary-color);
  background: var(--hover-color);
}

.performance-item__time {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color);
  min-width: 60px;
}

.performance-item__details {
  flex: 1;
}

.performance-item__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin-bottom: 4px;
}

.performance-item__venue {
  font-size: 13px;
  color: var(--secondary-text-color);
}

.utilization-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.utilization-item__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4px;
}

.utilization-item__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text-color);
}

.utilization-item__percentage {
  font-size: 16px;
  font-weight: 700;
  color: var(--primary-color);
}

.utilization-item__subtitle {
  font-size: 12px;
  color: var(--secondary-text-color);
  margin-bottom: 8px;
}

.utilization-item__bar {
  height: 8px;
  background: var(--border-color);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 6px;
}

.utilization-item__fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.utilization-low {
  background: rgb(34, 197, 94);
}

.utilization-medium {
  background: rgb(234, 179, 8);
}

.utilization-high {
  background: rgb(249, 115, 22);
}

.utilization-critical {
  background: rgb(239, 68, 68);
}

.utilization-item__stats {
  font-size: 12px;
  color: var(--secondary-text-color);
  text-align: right;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.activity-item__icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.activity-item__icon--blue {
  background: rgba(59, 130, 246, 0.1);
  color: rgb(59, 130, 246);
}

.activity-item__icon--green {
  background: rgba(34, 197, 94, 0.1);
  color: rgb(34, 197, 94);
}

.activity-item__icon--red {
  background: rgba(239, 68, 68, 0.1);
  color: rgb(239, 68, 68);
}

.activity-item__content {
  flex: 1;
  min-width: 0;
}

.activity-item__title {
  font-size: 13px;
  color: var(--primary-text-color);
  line-height: 1.4;
  margin-bottom: 2px;
}

.activity-item__time {
  font-size: 12px;
  color: var(--secondary-text-color);
}

@media (max-width: 1200px) {
  .foh-dashboard__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .foh-dashboard {
    padding: 16px;
  }

  .foh-dashboard__header {
    flex-direction: column;
  }

  .foh-dashboard__quick-actions {
    width: 100%;
    flex-direction: column;
  }

  .foh-dashboard__stats {
    grid-template-columns: 1fr;
  }
}
</style>
