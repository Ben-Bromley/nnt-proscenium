<template>
  <div class="performance-detail">
    <div
      v-if="pending"
      class="loading-state"
    >
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-loader-2"
          class="animate-spin"
        />
        <span>Loading performance details...</span>
      </div>
    </div>

    <div
      v-else-if="error"
      class="error-state"
    >
      <UAlert
        color="error"
        variant="soft"
        title="Failed to load performance"
        description="The performance could not be found or there was an error loading it."
      />
      <UButton
        color="neutral"
        variant="outline"
        @click="navigateTo('/admin/performances')"
      >
        Back to Performances
      </UButton>
    </div>

    <div
      v-else-if="performance"
      class="performance-detail__content"
    >
      <header class="performance-detail__header">
        <div class="performance-detail__title-section">
          <div>
            <h1 class="performance-detail__title">
              {{ performance.title }}
            </h1>
            <p
              v-if="performance.show"
              class="performance-detail__show"
            >
              <NuxtLink
                :to="`/admin/shows/${performance.show.id}`"
                class="show-link"
              >
                {{ performance.show.title }}
              </NuxtLink>
            </p>
          </div>
          <div class="performance-detail__actions">
            <UButton
              color="primary"
              icon="i-lucide-edit"
              @click="navigateTo(`/admin/performances/${performance.id}/edit`)"
            >
              Edit Performance
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              @click="goBack"
            >
              Back
            </UButton>
          </div>
        </div>
      </header>

      <div class="performance-detail__grid">
        <!-- Statistics Card -->
        <UCard v-if="performance.statistics">
          <template #header>
            <h2 class="card-title">
              Statistics
            </h2>
          </template>

          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-value">
                {{ performance.statistics.totalReservations }}
              </div>
              <div class="stat-label">
                Reservations
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-value">
                {{ performance.statistics.totalReserved }}
              </div>
              <div class="stat-label">
                Tickets Reserved
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-value">
                {{ performance.statistics.availableTickets }}
              </div>
              <div class="stat-label">
                Available
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-value">
                {{ performance.statistics.utilizationPercentage }}%
              </div>
              <div class="stat-label">
                Capacity Used
              </div>
            </div>

            <div class="stat-item">
              <div class="stat-value">
                £{{ (performance.statistics.totalRevenue / 100).toFixed(2) }}
              </div>
              <div class="stat-label">
                Total Revenue
              </div>
            </div>
          </div>
        </UCard>

        <!-- Performance Details Card -->
        <UCard>
          <template #header>
            <h2 class="card-title">
              Performance Details
            </h2>
          </template>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Status</span>
              <UBadge
                :color="getStatusColor(performance.status)"
                variant="soft"
              >
                {{ formatStatus(performance.status) }}
              </UBadge>
            </div>

            <div class="info-item">
              <span class="info-label">Type</span>
              <span class="info-value">{{ formatType(performance.type) }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Start Date & Time</span>
              <span class="info-value">{{ formatDateTime(performance.startDateTime) }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">End Date & Time</span>
              <span class="info-value">{{ formatDateTime(performance.endDateTime) }}</span>
            </div>

            <div
              v-if="performance.venue"
              class="info-item"
            >
              <span class="info-label">Venue</span>
              <span class="info-value">{{ performance.venue.name }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Max Capacity</span>
              <span class="info-value">{{ performance.maxCapacity === -1 ? 'Unlimited' : performance.maxCapacity }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Reservations</span>
              <UBadge
                :color="performance.reservationsOpen ? 'success' : 'neutral'"
                variant="soft"
              >
                {{ performance.reservationsOpen ? 'Open' : 'Closed' }}
              </UBadge>
            </div>

            <div
              v-if="performance.details"
              class="info-item info-item--full"
            >
              <span class="info-label">Details</span>
              <p class="info-description">
                {{ performance.details }}
              </p>
            </div>

            <div
              v-if="performance.reservationInstructions"
              class="info-item info-item--full"
            >
              <span class="info-label">Reservation Instructions</span>
              <p class="info-description">
                {{ performance.reservationInstructions }}
              </p>
            </div>

            <div
              v-if="performance.externalBookingLink"
              class="info-item info-item--full"
            >
              <span class="info-label">External Booking Link</span>
              <a
                :href="performance.externalBookingLink"
                target="_blank"
                class="info-link"
              >
                {{ performance.externalBookingLink }}
              </a>
            </div>
          </div>
        </UCard>

        <!-- Ticket Pricing Card -->
        <UCard v-if="performance.ticketPrices && performance.ticketPrices.length > 0">
          <template #header>
            <h2 class="card-title">
              Ticket Pricing
            </h2>
          </template>

          <div class="ticket-prices-list">
            <div
              v-for="price in performance.ticketPrices"
              :key="price.id"
              class="ticket-price-item"
            >
              <div class="ticket-price-info">
                <div class="ticket-price-name">
                  {{ price.ticketType.name }}
                </div>
                <div
                  v-if="price.notes"
                  class="ticket-price-notes"
                >
                  {{ price.notes }}
                </div>
              </div>
              <div class="ticket-price-value">
                £{{ (price.price / 100).toFixed(2) }}
              </div>
            </div>
          </div>
        </UCard>

        <!-- Recent Reservations Card -->
        <UCard
          v-if="performance.recentReservations && performance.recentReservations.length > 0"
          class="reservations-card"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="card-title">
                Recent Reservations ({{ performance.statistics?.totalReservations || 0 }})
              </h2>
              <UButton
                color="primary"
                variant="soft"
                size="sm"
                @click="navigateTo(`/admin/performances/${performance.id}/reservations`)"
              >
                View All
              </UButton>
            </div>
          </template>

          <div class="reservations-list">
            <div
              v-for="reservation in performance.recentReservations"
              :key="reservation.id"
              class="reservation-item"
            >
              <div class="reservation-info">
                <div class="reservation-code">
                  {{ reservation.reservationCode }}
                </div>
                <div class="reservation-customer">
                  {{ reservation.customerName }} • {{ reservation.customerEmail }}
                </div>
                <div class="reservation-tickets">
                  {{ reservation.reservedTickets.reduce((sum: number, t: any) => sum + t.quantity, 0) }} ticket(s)
                </div>
              </div>
              <div class="reservation-meta">
                <UBadge
                  :color="getReservationStatusColor(reservation.status)"
                  variant="soft"
                  size="sm"
                >
                  {{ formatReservationStatus(reservation.status) }}
                </UBadge>
                <div class="reservation-price">
                  £{{ (reservation.totalPrice / 100).toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Metadata Card -->
        <UCard>
          <template #header>
            <h2 class="card-title">
              Metadata
            </h2>
          </template>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Created</span>
              <span class="info-value">{{ formatDateTime(performance.createdAt) }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Last Updated</span>
              <span class="info-value">{{ formatDateTime(performance.updatedAt) }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Performance ID</span>
              <code class="info-code">{{ performance.id }}</code>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
  layout: 'admin',
})

const route = useRoute()
const performanceId = route.params.id as string

const { data: response, pending, error } = await useFetch(`/api/v1/admin/performances/${performanceId}`)

const performance = computed(() => response.value?.data)

// Formatters
const { formatDateTime } = useFormatters()

function formatStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function formatType(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function formatReservationStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function getStatusColor(status: string): 'neutral' | 'success' | 'warning' | 'error' {
  const colorMap: Record<string, 'neutral' | 'success' | 'warning' | 'error'> = {
    SCHEDULED: 'neutral',
    ON_SALE: 'success',
    RESTRICTED: 'warning',
    CLOSED: 'neutral',
    SOLD_OUT: 'error',
    CANCELLED: 'error',
    PAST: 'neutral',
  }
  return colorMap[status] || 'neutral'
}

function getReservationStatusColor(status: string): 'neutral' | 'success' | 'warning' | 'error' {
  const colorMap: Record<string, 'neutral' | 'success' | 'warning' | 'error'> = {
    PENDING: 'warning',
    CONFIRMED: 'success',
    COLLECTED: 'success',
    CANCELLED_BY_CUSTOMER: 'error',
    CANCELLED_BY_ADMIN: 'error',
    NO_SHOW: 'neutral',
  }
  return colorMap[status] || 'neutral'
}

function goBack() {
  if (performance.value?.show?.id) {
    navigateTo(`/admin/shows/${performance.value.show.id}`)
  }
  else {
    navigateTo('/admin/performances')
  }
}
</script>

<style scoped>
.performance-detail {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px 24px;
}

.performance-detail__header {
  margin-bottom: 32px;
}

.performance-detail__title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.performance-detail__title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.performance-detail__show {
  margin: 4px 0 0 0;
  font-size: 14px;
  color: var(--color-gray-600);
}

.show-link {
  color: var(--color-primary-600);
  text-decoration: none;
}

.show-link:hover {
  text-decoration: underline;
}

.performance-detail__actions {
  display: flex;
  gap: 8px;
}

.performance-detail__grid {
  display: grid;
  gap: 24px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: var(--color-gray-50);
  border-radius: 8px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-primary-600);
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-gray-600);
  letter-spacing: 0.5px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item--full {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-gray-600);
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  color: var(--color-gray-900);
}

.info-description {
  font-size: 14px;
  color: var(--color-gray-700);
  line-height: 1.5;
  margin: 0;
}

.info-link {
  font-size: 14px;
  color: var(--color-primary-600);
  text-decoration: none;
}

.info-link:hover {
  text-decoration: underline;
}

.info-code {
  font-family: monospace;
  font-size: 13px;
  padding: 4px 8px;
  background: var(--color-gray-100);
  border-radius: 4px;
  color: var(--color-gray-800);
}

.ticket-prices-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ticket-price-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 12px;
  background: var(--color-gray-50);
  border-radius: 6px;
}

.ticket-price-info {
  flex: 1;
}

.ticket-price-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.ticket-price-notes {
  font-size: 13px;
  color: var(--color-gray-600);
}

.ticket-price-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--color-primary-600);
}

.reservations-card {
  grid-column: 1 / -1;
}

.reservations-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.reservation-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 12px;
  border: 1px solid var(--color-gray-200);
  border-radius: 6px;
}

.reservation-info {
  flex: 1;
}

.reservation-code {
  font-family: monospace;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.reservation-customer {
  font-size: 13px;
  color: var(--color-gray-700);
  margin-bottom: 2px;
}

.reservation-tickets {
  font-size: 13px;
  color: var(--color-gray-600);
}

.reservation-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
}

.reservation-price {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-gray-900);
}

@media (min-width: 768px) {
  .performance-detail__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
