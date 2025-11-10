<template>
  <div class="reservation-confirmation">
    <UPageHero
      title="Reservation Confirmed!"
      description="Your tickets have been reserved"
    />

    <UContainer class="py-12">
      <LoadingSpinner v-if="loading" />

      <UAlert
        v-else-if="error"
        icon="i-lucide-alert-circle"
        color="error"
        variant="soft"
        :title="error"
        class="mb-6"
      />

      <div
        v-else-if="reservation"
        class="confirmation-content"
      >
        <!-- Success Message -->
        <UCard class="success-card">
          <div class="success-content">
            <div class="success-icon">
              <UIcon
                name="i-lucide-check-circle"
                class="icon"
              />
            </div>
            <h2 class="success-title">
              Your Reservation is Confirmed
            </h2>
            <p class="success-message">
              A confirmation email has been sent to {{ reservation.customerEmail }}
            </p>
          </div>
        </UCard>

        <!-- Reservation Details -->
        <UCard class="details-card">
          <template #header>
            <h3 class="card-title">
              Reservation Details
            </h3>
          </template>

          <div class="details-content">
            <!-- Reservation Code -->
            <div class="detail-section">
              <div class="code-display">
                <span class="code-label">Reservation Code</span>
                <span class="code-value">{{ reservation.reservationCode }}</span>
              </div>
              <p class="code-hint">
                Please quote this code when collecting your tickets
              </p>
            </div>

            <!-- Performance Info -->
            <div class="detail-section">
              <h4 class="section-heading">
                Performance
              </h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Show</span>
                  <span class="info-value">{{ reservation.performance?.show?.title }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Date</span>
                  <span class="info-value">{{ formatDate(reservation.performance?.startDateTime) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Time</span>
                  <span class="info-value">{{ formatTime(reservation.performance?.startDateTime, reservation.performance?.endDateTime) }}</span>
                </div>
                <div
                  v-if="reservation.performance?.venue"
                  class="info-item"
                >
                  <span class="info-label">Venue</span>
                  <span class="info-value">{{ reservation.performance.venue.name }}</span>
                </div>
              </div>
            </div>

            <!-- Tickets -->
            <div class="detail-section">
              <h4 class="section-heading">
                Tickets
              </h4>
              <div class="tickets-list">
                <div
                  v-for="ticket in reservation.reservedTickets"
                  :key="ticket.id"
                  class="ticket-item"
                >
                  <span class="ticket-name">
                    {{ ticket.quantity }}x {{ ticket.ticketType?.name }}
                  </span>
                  <span class="ticket-price">
                    £{{ (ticket.pricePerItemAtReservation * ticket.quantity).toFixed(2) }}
                  </span>
                </div>
              </div>
              <div class="tickets-total">
                <span class="total-label">Total Amount</span>
                <span class="total-value">£{{ reservation.totalPrice.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Contact Info -->
            <div class="detail-section">
              <h4 class="section-heading">
                Contact Information
              </h4>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">Name</span>
                  <span class="info-value">{{ reservation.customerName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email</span>
                  <span class="info-value">{{ reservation.customerEmail }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Phone</span>
                  <span class="info-value">{{ reservation.customerPhone }}</span>
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Important Information -->
        <UCard class="info-card">
          <template #header>
            <h3 class="card-title">
              <UIcon name="i-lucide-info" />
              Important Information
            </h3>
          </template>

          <div class="info-content">
            <ul class="info-list">
              <li>
                <strong>Collect & Pay:</strong> Tickets must be collected and paid for at the venue before the performance
              </li>
              <li>
                <strong>Arrival Time:</strong> Please arrive at least 15 minutes before the start time
              </li>
              <li>
                <strong>Reservation Code:</strong> Bring your reservation code ({{ reservation.reservationCode }}) when collecting tickets
              </li>
              <li>
                <strong>Deadline:</strong> Reservations are held until 10 minutes before the performance start time
              </li>
              <li>
                <strong>Changes:</strong> If you need to make changes, please contact us as soon as possible
              </li>
            </ul>
          </div>
        </UCard>

        <!-- Actions -->
        <div class="confirmation-actions">
          <UButton
            to="/whats-on"
            color="primary"
            size="lg"
          >
            <UIcon name="i-lucide-arrow-left" />
            Browse More Shows
          </UButton>
          <UButton
            color="neutral"
            size="lg"
            variant="outline"
            @click="printPage"
          >
            <UIcon name="i-lucide-printer" />
            Print Confirmation
          </UButton>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const reservationCode = route.query.code as string

definePageMeta({
  layout: 'default',
  title: 'Reservation Confirmed',
})

interface ReservedTicket {
  id: string
  quantity: number
  pricePerItemAtReservation: number
  ticketType?: {
    name: string
  }
}

interface Reservation {
  id: string
  reservationCode: string
  customerName: string
  customerEmail: string
  customerPhone: string
  totalPrice: number
  performance?: {
    startDateTime: string
    endDateTime: string
    show?: {
      title: string
    }
    venue?: {
      name: string
    }
  }
  reservedTickets: ReservedTicket[]
}

// State
const loading = ref(true)
const error = ref<string | null>(null)
const reservation = ref<Reservation | null>(null)

// Load reservation data
async function loadReservation() {
  try {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await useFetch(`/api/v1/reservations/${reservationCode}`)

    if (fetchError.value) {
      throw new Error(fetchError.value.statusMessage || 'Failed to load reservation')
    }

    if (!data.value?.data) {
      throw new Error('Reservation not found')
    }

    reservation.value = data.value.data as Reservation
  }
  catch (err) {
    error.value = (err as Error).message || 'Failed to load reservation'
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!reservationCode) {
    error.value = 'No reservation code provided'
    loading.value = false
    return
  }

  loadReservation()
})

// Formatters
function formatDate(dateString: string | undefined): string {
  if (!dateString)
    return 'N/A'
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatTime(startString: string | undefined, endString: string | undefined): string {
  if (!startString || !endString)
    return 'N/A'
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

function printPage() {
  window.print()
}
</script>

<style scoped>
.reservation-confirmation {
  min-height: 100vh;
}

.confirmation-content {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.success-card {
  text-align: center;
  background: linear-gradient(135deg, var(--success-color, #10b981) 0%, var(--primary-color) 100%);
  color: white;
}

.success-content {
  padding: 40px 24px;
}

.success-icon {
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.success-icon .icon {
  font-size: 80px;
  color: white;
}

.success-title {
  font-size: 32px;
  font-weight: 700;
  color: white;
  margin: 0 0 12px 0;
}

.success-message {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.details-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.code-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: var(--hover-color);
  border-radius: 12px;
  border: 2px dashed var(--border-color);
}

.code-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--secondary-text-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.code-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--primary-color);
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
}

.code-hint {
  text-align: center;
  font-size: 13px;
  color: var(--secondary-text-color);
  margin: 0;
}

.section-heading {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border-color);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 13px;
  color: var(--secondary-text-color);
  font-weight: 500;
}

.info-value {
  font-size: 15px;
  color: var(--primary-text-color);
}

.tickets-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ticket-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--hover-color);
  border-radius: 8px;
}

.ticket-name {
  font-size: 15px;
  color: var(--primary-text-color);
}

.ticket-price {
  font-size: 15px;
  font-weight: 600;
  color: var(--primary-text-color);
}

.tickets-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--surface-color);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  margin-top: 8px;
}

.total-label {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-text-color);
}

.total-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--primary-color);
}

.info-content {
  color: var(--secondary-text-color);
}

.info-list {
  margin: 0;
  padding-left: 24px;
  list-style: none;
}

.info-list li {
  position: relative;
  margin-bottom: 12px;
  line-height: 1.6;
  padding-left: 8px;
}

.info-list li::before {
  content: '•';
  position: absolute;
  left: -16px;
  color: var(--primary-color);
  font-weight: bold;
}

.info-list strong {
  color: var(--primary-text-color);
}

.confirmation-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 16px;
}

@media (max-width: 768px) {
  .confirmation-actions {
    flex-direction: column;
  }

  .code-value {
    font-size: 28px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}

@media print {
  .confirmation-actions {
    display: none;
  }
}
</style>
