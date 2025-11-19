<template>
  <div class="reservation-new">
    <UPageHero
      title="Reserve Tickets"
      description="Complete the form below to reserve your tickets"
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
        v-else-if="performance"
        class="reservation-content"
      >
        <!-- Performance Summary -->
        <UCard class="performance-summary">
          <template #header>
            <h2 class="summary-title">
              Performance Details
            </h2>
          </template>

          <div class="summary-content">
            <h3 class="show-title">
              {{ performance.show?.title }}
            </h3>
            <div class="performance-details">
              <div class="detail-item">
                <UIcon name="i-lucide-calendar" />
                <span>{{ formatDate(performance.startDateTime) }}</span>
              </div>
              <div class="detail-item">
                <UIcon name="i-lucide-clock" />
                <span>{{ formatTime(performance.startDateTime, performance.runtimeMinutes, performance.intervalMinutes) }}</span>
              </div>
              <div
                v-if="performance.venue"
                class="detail-item"
              >
                <UIcon name="i-lucide-map-pin" />
                <span>{{ performance.venue.name }}</span>
              </div>
            </div>

            <div class="availability">
              <span class="availability-label">Seats Available:</span>
              <span class="availability-value">{{ availableSeats }}</span>
            </div>
          </div>
        </UCard>

        <!-- Reservation Form -->
        <UCard class="reservation-form">
          <template #header>
            <h2 class="form-title">
              Your Details
            </h2>
          </template>

          <UForm
            :state="formState"
            @submit="handleSubmit"
          >
            <div class="form-content">
              <!-- Ticket Selection -->
              <section class="form-section">
                <h3 class="section-title">
                  Select Tickets
                </h3>

                <div
                  v-if="ticketTypes.length === 0"
                  class="no-tickets"
                >
                  <UAlert
                    icon="i-lucide-info"
                    color="info"
                    variant="soft"
                    title="No ticket types available for this performance"
                  />
                </div>

                <div
                  v-else
                  class="ticket-types"
                >
                  <div
                    v-for="ticketType in ticketTypes"
                    :key="ticketType.id"
                    class="ticket-type"
                  >
                    <div class="ticket-info">
                      <span class="ticket-name">{{ ticketType.ticketType.name }}</span>
                      <span class="ticket-price">£{{ formatPrice(ticketType.price) }}</span>
                    </div>
                    <div class="ticket-quantity">
                      <UButton
                        icon="i-lucide-minus"
                        size="sm"
                        color="neutral"
                        :disabled="getTicketQuantity(ticketType.ticketType.id) === 0"
                        @click="decrementTicket(ticketType.ticketType.id)"
                      />
                      <span class="quantity-value">{{ getTicketQuantity(ticketType.ticketType.id) }}</span>
                      <UButton
                        icon="i-lucide-plus"
                        size="sm"
                        color="neutral"
                        :disabled="totalTickets >= availableSeats"
                        @click="incrementTicket(ticketType.ticketType.id)"
                      />
                    </div>
                  </div>
                </div>

                <div
                  v-if="totalTickets > 0"
                  class="ticket-total"
                >
                  <span class="total-label">Total</span>
                  <span class="total-value">£{{ totalPrice.toFixed(2) }}</span>
                </div>
              </section>

              <!-- Customer Information -->
              <section class="form-section">
                <h3 class="section-title">
                  Contact Information
                </h3>

                <div class="form-fields">
                  <UFormField
                    label="Full Name"
                    name="customerName"
                    required
                  >
                    <UInput
                      v-model="formState.customerName"
                      placeholder="John Smith"
                      size="lg"
                    />
                  </UFormField>

                  <UFormField
                    label="Email Address"
                    name="customerEmail"
                    required
                  >
                    <UInput
                      v-model="formState.customerEmail"
                      type="email"
                      placeholder="john.smith@example.com"
                      size="lg"
                    />
                  </UFormField>

                  <UFormField
                    label="Phone Number"
                    name="customerPhone"
                    required
                  >
                    <UInput
                      v-model="formState.customerPhone"
                      type="tel"
                      placeholder="07123 456789"
                      size="lg"
                    />
                  </UFormField>

                  <UFormField
                    label="Additional Notes (Optional)"
                    name="notes"
                  >
                    <UTextarea
                      v-model="formState.notes"
                      placeholder="Any special requirements or notes..."
                      :rows="3"
                    />
                  </UFormField>
                </div>
              </section>

              <!-- Important Information -->
              <section class="form-section">
                <UAlert
                  icon="i-lucide-info"
                  color="info"
                  variant="soft"
                  class="info-box"
                >
                  <template #title>
                    Important Information
                  </template>
                  <template #description>
                    <ul class="info-list">
                      <li>Tickets must be collected and paid for at the venue before the performance</li>
                      <li>Please arrive at least 15 minutes before the start time</li>
                      <li>You will receive a confirmation email with your reservation code</li>
                      <li>Reservations are held until 10 minutes before the performance start time</li>
                    </ul>
                  </template>
                </UAlert>
              </section>

              <!-- Submit Button -->
              <div class="form-actions">
                <UButton
                  type="submit"
                  color="primary"
                  size="lg"
                  block
                  :loading="submitting"
                  :disabled="!canSubmit"
                >
                  Complete Reservation
                </UButton>
              </div>
            </div>
          </UForm>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

definePageMeta({
  layout: 'default',
  title: 'Reserve Tickets',
})

const performanceId = route.query.performanceId as string

// Interfaces
interface TicketType {
  id: string
  ticketType: {
    id: string
    name: string
    description?: string
  }
  price: number
}

interface Performance {
  id: string
  startDateTime: string
  runtimeMinutes: number
  intervalMinutes: number
  maxCapacity: number
  show?: {
    title: string
    showTicketPrices?: TicketType[]
  }
  venue?: {
    name: string
  }
  availability?: {
    totalCapacity: number
    availableTickets: number
    reservedCount: number
    isAvailable: boolean
  }
}

// State
const loading = ref(true)
const submitting = ref(false)
const error = ref<string | null>(null)
const performance = ref<Performance | null>(null)
const ticketTypes = ref<TicketType[]>([])
const ticketQuantities = ref<Record<string, number>>({})

const formState = ref({
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  notes: '',
})

// Load performance data
async function loadPerformance() {
  try {
    loading.value = true
    error.value = null

    const { data, error: fetchError } = await useFetch(`/api/v1/performances/${performanceId}`)

    if (fetchError.value) {
      throw new Error(fetchError.value.statusMessage || 'Failed to load performance')
    }

    if (!data.value?.data) {
      throw new Error('Performance not found')
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    performance.value = data.value.data as any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ticketTypes.value = (performance.value?.show as any)?.showTicketPrices || []
  }
  catch (err) {
    error.value = (err as Error).message || 'Failed to load performance'
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  if (!performanceId) {
    error.value = 'No performance selected'
    loading.value = false
    return
  }

  loadPerformance()
})

// Computed
const availableSeats = computed(() => {
  if (!performance.value)
    return 0
  // Use the availability data that the API already provides
  return performance.value.availability?.availableTickets || 0
})

const totalTickets = computed(() => {
  return Object.values(ticketQuantities.value).reduce((sum, qty) => sum + qty, 0)
})

const totalPrice = computed(() => {
  let total = 0
  for (const [ticketTypeId, quantity] of Object.entries(ticketQuantities.value)) {
    const ticketType = ticketTypes.value.find(tt => tt.ticketType.id === ticketTypeId)
    if (ticketType) {
      total += ticketType.price * quantity
    }
  }
  return total
})

const canSubmit = computed(() => {
  return (
    totalTickets.value > 0
    && formState.value.customerName.trim() !== ''
    && formState.value.customerEmail.trim() !== ''
    && formState.value.customerPhone.trim() !== ''
    && !submitting.value
  )
})

// Price formatter
function formatPrice(price: number): string {
  return price.toFixed(2)
}

// Ticket quantity helpers
function getTicketQuantity(ticketTypeId: string): number {
  return ticketQuantities.value[ticketTypeId] || 0
}

function incrementTicket(ticketTypeId: string) {
  const current = ticketQuantities.value[ticketTypeId] || 0
  ticketQuantities.value[ticketTypeId] = current + 1
}

function decrementTicket(ticketTypeId: string) {
  const current = ticketQuantities.value[ticketTypeId] || 0
  if (current > 0) {
    ticketQuantities.value[ticketTypeId] = current - 1
  }
}

// Form submission
async function handleSubmit() {
  try {
    submitting.value = true
    error.value = null

    // Build tickets array
    const tickets = []
    for (const [ticketTypeId, quantity] of Object.entries(ticketQuantities.value)) {
      if (quantity > 0) {
        tickets.push({
          ticketTypeId,
          quantity,
        })
      }
    }

    const payload = {
      performanceId,
      customerName: formState.value.customerName.trim(),
      customerEmail: formState.value.customerEmail.trim(),
      customerPhone: formState.value.customerPhone.trim(),
      notes: formState.value.notes.trim() || undefined,
      tickets,
    }

    const { data, error: submitError } = await useFetch('/api/v1/reservations', {
      method: 'POST',
      body: payload,
    })

    if (submitError.value) {
      throw new Error(submitError.value.statusMessage || 'Failed to create reservation')
    }

    if (!data.value?.data) {
      throw new Error('Failed to create reservation')
    }

    // Redirect to confirmation page
    const reservation = data.value.data
    await router.push(`/reservation/confirmation?code=${reservation.reservationCode}`)
  }
  catch (err) {
    error.value = (err as Error).message || 'Failed to create reservation'
  }
  finally {
    submitting.value = false
  }
}

// Formatters
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatTime(startString: string, runtimeMinutes: number, intervalMinutes: number): string {
  const start = new Date(startString)
  const end = new Date(start.getTime() + runtimeMinutes * 60000)
  const startTime = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(start)
  const endTime = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(end)
  const intervalText = intervalMinutes > 0 ? ` (inc. ${intervalMinutes}min interval)` : ''
  return `${startTime} - ${endTime}${intervalText}`
}
</script>

<style scoped>
.reservation-new {
  min-height: 100vh;
}

.reservation-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 32px;
  align-items: start;
}

.performance-summary {
  position: sticky;
  top: 24px;
}

.summary-title,
.form-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.show-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0;
}

.performance-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: var(--secondary-text-color);
}

.availability {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--hover-color);
  border-radius: 8px;
}

.availability-label {
  font-size: 14px;
  color: var(--secondary-text-color);
}

.availability-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-text-color);
}

.form-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0;
}

.ticket-types {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ticket-type {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--hover-color);
  border-radius: 8px;
}

.ticket-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ticket-name {
  font-size: 15px;
  font-weight: 500;
  color: var(--primary-text-color);
}

.ticket-price {
  font-size: 14px;
  color: var(--secondary-text-color);
}

.ticket-quantity {
  display: flex;
  align-items: center;
  gap: 16px;
}

.quantity-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-text-color);
  min-width: 32px;
  text-align: center;
}

.ticket-total {
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

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-box :deep(.u-alert-description) {
  margin-top: 8px;
}

.info-list {
  margin: 0;
  padding-left: 20px;
  list-style: disc;
}

.info-list li {
  margin-bottom: 4px;
  line-height: 1.5;
}

.form-actions {
  padding-top: 8px;
}

.no-tickets {
  padding: 16px 0;
}

@media (max-width: 1024px) {
  .reservation-content {
    grid-template-columns: 1fr;
  }

  .performance-summary {
    position: static;
    order: -1;
  }
}
</style>
