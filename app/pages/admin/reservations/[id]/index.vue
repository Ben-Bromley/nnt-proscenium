<template>
  <div class="reservation-detail">
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
      v-else-if="reservation"
      class="reservation-detail__content"
    >
      <!-- Header -->
      <header class="reservation-detail__header">
        <div class="reservation-detail__header-content">
          <div class="reservation-detail__breadcrumb">
            <UButton
              icon="i-lucide-arrow-left"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="navigateTo('/admin/reservations')"
            >
              Back to Reservations
            </UButton>
          </div>

          <div class="reservation-detail__title-section">
            <div>
              <h1 class="reservation-detail__title">
                Reservation {{ reservation.reservationCode }}
              </h1>
              <div class="reservation-detail__subtitle">
                Created {{ formatDateTime(reservation.createdAt) }}
              </div>
            </div>

            <div class="reservation-detail__actions">
              <UBadge
                :color="getStatusColor(reservation.status)"
                variant="soft"
                size="lg"
              >
                {{ formatStatus(reservation.status) }}
              </UBadge>

              <UButton
                v-if="canCollectPayment"
                icon="i-lucide-banknote"
                color="green"
                @click="collectPayment"
              >
                Collect Payment
              </UButton>

              <UButton
                v-if="canCancel"
                icon="i-lucide-x-circle"
                color="red"
                variant="outline"
                @click="cancelReservation"
              >
                Cancel Reservation
              </UButton>

              <UButton
                v-if="canMarkNoShow"
                icon="i-lucide-user-x"
                color="orange"
                variant="outline"
                @click="markNoShow"
              >
                Mark No Show
              </UButton>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <div class="reservation-detail__grid">
        <!-- Customer Information -->
        <UCard>
          <template #header>
            <div class="card-header">
              <UIcon
                name="i-lucide-user"
                class="card-header__icon"
              />
              <h2 class="card-header__title">
                Customer Information
              </h2>
            </div>
          </template>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-item__label">
                Name
              </div>
              <div class="info-item__value">
                {{ reservation.customerName }}
              </div>
            </div>

            <div class="info-item">
              <div class="info-item__label">
                Email
              </div>
              <div class="info-item__value">
                <a
                  :href="`mailto:${reservation.customerEmail}`"
                  class="email-link"
                >
                  {{ reservation.customerEmail }}
                </a>
              </div>
            </div>

            <div
              v-if="reservation.customerPhone"
              class="info-item"
            >
              <div class="info-item__label">
                Phone
              </div>
              <div class="info-item__value">
                <a
                  :href="`tel:${reservation.customerPhone}`"
                  class="phone-link"
                >
                  {{ reservation.customerPhone }}
                </a>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Performance Information -->
        <UCard>
          <template #header>
            <div class="card-header">
              <UIcon
                name="i-lucide-ticket"
                class="card-header__icon"
              />
              <h2 class="card-header__title">
                Performance Details
              </h2>
            </div>
          </template>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-item__label">
                Show
              </div>
              <div class="info-item__value">
                <NuxtLink
                  :to="`/admin/shows/${reservation.performance.show.id}`"
                  class="link"
                >
                  {{ reservation.performance.show.title }}
                </NuxtLink>
              </div>
            </div>

            <div class="info-item">
              <div class="info-item__label">
                Performance
              </div>
              <div class="info-item__value">
                <NuxtLink
                  :to="`/admin/performances/${reservation.performance.id}`"
                  class="link"
                >
                  {{ formatDateTime(reservation.performance.startDateTime) }}
                </NuxtLink>
              </div>
            </div>

            <div class="info-item">
              <div class="info-item__label">
                Venue
              </div>
              <div class="info-item__value">
                {{ reservation.performance.venue.name }}
              </div>
            </div>
          </div>
        </UCard>

        <!-- Tickets -->
        <UCard class="full-width">
          <template #header>
            <div class="card-header">
              <UIcon
                name="i-lucide-receipt"
                class="card-header__icon"
              />
              <h2 class="card-header__title">
                Reserved Tickets
              </h2>
            </div>
          </template>

          <div class="tickets-table">
            <table>
              <thead>
                <tr>
                  <th>Ticket Type</th>
                  <th class="text-center">
                    Quantity
                  </th>
                  <th class="text-right">
                    Unit Price
                  </th>
                  <th class="text-right">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="ticket in reservation.reservedTickets"
                  :key="ticket.id"
                >
                  <td>{{ ticket.ticketType.name }}</td>
                  <td class="text-center">
                    {{ ticket.quantity }}
                  </td>
                  <td class="text-right">
                    £{{ (ticket.ticketType.price / 100).toFixed(2) }}
                  </td>
                  <td class="text-right">
                    £{{ (ticket.ticketType.price * ticket.quantity / 100).toFixed(2) }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="total-row">
                  <td
                    colspan="3"
                    class="text-right"
                  >
                    <strong>Total</strong>
                  </td>
                  <td class="text-right">
                    <strong>£{{ (reservation.totalPrice / 100).toFixed(2) }}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </UCard>

        <!-- Payment & Status Information -->
        <UCard>
          <template #header>
            <div class="card-header">
              <UIcon
                name="i-lucide-credit-card"
                class="card-header__icon"
              />
              <h2 class="card-header__title">
                Payment Information
              </h2>
            </div>
          </template>

          <div class="info-grid">
            <div class="info-item">
              <div class="info-item__label">
                Total Amount
              </div>
              <div class="info-item__value amount">
                £{{ (reservation.totalPrice / 100).toFixed(2) }}
              </div>
            </div>

            <div class="info-item">
              <div class="info-item__label">
                Status
              </div>
              <div class="info-item__value">
                <UBadge
                  :color="getStatusColor(reservation.status)"
                  variant="soft"
                >
                  {{ formatStatus(reservation.status) }}
                </UBadge>
              </div>
            </div>

            <div
              v-if="reservation.collectedAt"
              class="info-item"
            >
              <div class="info-item__label">
                Collected At
              </div>
              <div class="info-item__value">
                {{ formatDateTime(reservation.collectedAt) }}
              </div>
            </div>

            <div
              v-if="reservation.cancelledAt"
              class="info-item"
            >
              <div class="info-item__label">
                Cancelled At
              </div>
              <div class="info-item__value">
                {{ formatDateTime(reservation.cancelledAt) }}
              </div>
            </div>
          </div>
        </UCard>

        <!-- Admin Notes (if any) -->
        <UCard
          v-if="reservation.adminNotes"
          class="full-width"
        >
          <template #header>
            <div class="card-header">
              <UIcon
                name="i-lucide-file-text"
                class="card-header__icon"
              />
              <h2 class="card-header__title">
                Admin Notes
              </h2>
            </div>
          </template>

          <div class="admin-notes">
            {{ reservation.adminNotes }}
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
const { formatDateTime } = useFormatters()

// Fetch reservation details
const { data: reservation, pending, error: fetchError } = await useFetch(
  `/api/v1/foh/reservations/${route.params.id}`,
  {
    key: `reservation-${route.params.id}`,
  },
)

const error = ref<string | null>(null)

watchEffect(() => {
  if (fetchError.value) {
    error.value = fetchError.value.statusMessage || 'Failed to load reservation'
  }
  else {
    error.value = null
  }
})

// Action permissions
const canCollectPayment = computed(() => {
  return reservation.value?.status === 'PENDING_COLLECTION'
})

const canCancel = computed(() => {
  return reservation.value && [
    'PENDING_COLLECTION',
    'COLLECTED',
  ].includes(reservation.value.status)
})

const canMarkNoShow = computed(() => {
  return reservation.value?.status === 'PENDING_COLLECTION'
})

// Status helpers
function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    PENDING_COLLECTION: 'yellow',
    COLLECTED: 'green',
    PURCHASED_ON_DOOR: 'blue',
    CANCELLED_BY_CUSTOMER: 'gray',
    CANCELLED_BY_ADMIN: 'gray',
    NO_SHOW: 'orange',
    EXPIRED: 'red',
  }
  return colorMap[status] || 'gray'
}

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// Action handlers
async function collectPayment() {
  if (!reservation.value) return

  try {
    const { data, error: updateError } = await useFetch(
      `/api/v1/foh/reservations/${reservation.value.id}/collect`,
      {
        method: 'POST',
      },
    )

    if (updateError.value) {
      error.value = updateError.value.statusMessage || 'Failed to collect payment'
    }
    else if (data.value) {
      // Refresh the reservation data
      await refreshNuxtData(`reservation-${route.params.id}`)
      error.value = null
    }
  }
  catch (err) {
    error.value = 'An unexpected error occurred'
  }
}

async function cancelReservation() {
  if (!reservation.value) return

  if (!confirm('Are you sure you want to cancel this reservation?')) {
    return
  }

  try {
    const { data, error: updateError } = await useFetch(
      `/api/v1/foh/reservations/${reservation.value.id}`,
      {
        method: 'PATCH',
        body: {
          status: 'CANCELLED_BY_ADMIN',
        },
      },
    )

    if (updateError.value) {
      error.value = updateError.value.statusMessage || 'Failed to cancel reservation'
    }
    else if (data.value) {
      await refreshNuxtData(`reservation-${route.params.id}`)
      error.value = null
    }
  }
  catch (err) {
    error.value = 'An unexpected error occurred'
  }
}

async function markNoShow() {
  if (!reservation.value) return

  if (!confirm('Are you sure you want to mark this as a no-show?')) {
    return
  }

  try {
    const { data, error: updateError } = await useFetch(
      `/api/v1/foh/reservations/${reservation.value.id}`,
      {
        method: 'PATCH',
        body: {
          status: 'NO_SHOW',
        },
      },
    )

    if (updateError.value) {
      error.value = updateError.value.statusMessage || 'Failed to mark as no-show'
    }
    else if (data.value) {
      await refreshNuxtData(`reservation-${route.params.id}`)
      error.value = null
    }
  }
  catch (err) {
    error.value = 'An unexpected error occurred'
  }
}
</script>

<style scoped>
.reservation-detail {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.reservation-detail__header {
  margin-bottom: 32px;
}

.reservation-detail__breadcrumb {
  margin-bottom: 16px;
}

.reservation-detail__title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
}

.reservation-detail__title {
  font-size: 28px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0 0 4px 0;
}

.reservation-detail__subtitle {
  font-size: 14px;
  color: var(--secondary-text-color);
}

.reservation-detail__actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.reservation-detail__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.full-width {
  grid-column: 1 / -1;
}

.card-header {
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

.info-grid {
  display: grid;
  gap: 20px;
}

.info-item__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--secondary-text-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.info-item__value {
  font-size: 15px;
  color: var(--primary-text-color);
  word-break: break-word;
}

.info-item__value.amount {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-color);
}

.email-link,
.phone-link,
.link {
  color: var(--primary-color);
  text-decoration: none;
}

.email-link:hover,
.phone-link:hover,
.link:hover {
  text-decoration: underline;
}

.tickets-table {
  overflow-x: auto;
}

.tickets-table table {
  width: 100%;
  border-collapse: collapse;
}

.tickets-table th {
  padding: 12px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--secondary-text-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid var(--border-color);
}

.tickets-table td {
  padding: 12px;
  font-size: 14px;
  color: var(--primary-text-color);
  border-bottom: 1px solid var(--border-color);
}

.tickets-table .text-center {
  text-align: center;
}

.tickets-table .text-right {
  text-align: right;
}

.tickets-table tfoot {
  border-top: 2px solid var(--border-color);
}

.tickets-table .total-row td {
  padding: 16px 12px;
  font-size: 15px;
  border-bottom: none;
}

.admin-notes {
  font-size: 14px;
  line-height: 1.6;
  color: var(--primary-text-color);
  white-space: pre-wrap;
}

@media (max-width: 1024px) {
  .reservation-detail__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .reservation-detail {
    padding: 16px;
  }

  .reservation-detail__title-section {
    flex-direction: column;
    align-items: stretch;
  }

  .reservation-detail__actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
