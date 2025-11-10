<template>
  <div class="foh-walkin">
    <header class="foh-walkin__header">
      <div>
        <h1 class="foh-walkin__title">
          Walk-in Sales
        </h1>
        <div class="foh-walkin__subtitle">
          Create reservations for customers at the door
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

    <div class="foh-walkin__content">
      <UCard>
        <template #header>
          <div class="card-header">
            <UIcon
              name="i-lucide-user-plus"
              class="card-header__icon"
            />
            <h2 class="card-header__title">
              Create New Reservation
            </h2>
          </div>
        </template>

        <UAlert
          v-if="error"
          icon="i-lucide-alert-circle"
          color="error"
          variant="soft"
          :title="error"
          class="mb-6"
        />

        <LoadingSpinner v-if="loadingPerformances" />

        <UForm
          v-else
          :state="formState"
          @submit="handleSubmit"
        >
          <div class="form-grid">
            <!-- Performance Selection -->
            <div class="form-section full-width">
              <h3 class="section-title">
                Performance Details
              </h3>

              <UFormGroup
                label="Performance"
                name="performanceId"
                required
              >
                <USelect
                  v-model="formState.performanceId"
                  :options="performanceOptions"
                  placeholder="Select a performance"
                  @change="onPerformanceChange"
                />
              </UFormGroup>

              <div
                v-if="selectedPerformance"
                class="performance-info"
              >
                <div class="info-grid">
                  <div class="info-item">
                    <div class="info-label">
                      Show
                    </div>
                    <div class="info-value">
                      {{ selectedPerformance.show?.title || 'Unknown Show' }}
                    </div>
                  </div>

                  <div class="info-item">
                    <div class="info-label">
                      Venue
                    </div>
                    <div class="info-value">
                      {{ selectedPerformance.venue?.name || 'Unknown Venue' }}
                    </div>
                  </div>

                  <div class="info-item">
                    <div class="info-label">
                      Available Seats
                    </div>
                    <div class="info-value">
                      {{ selectedPerformance.availableSeats }} / {{ selectedPerformance.maxCapacity }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Customer Information -->
            <div class="form-section full-width">
              <h3 class="section-title">
                Customer Information
              </h3>

              <div class="form-row">
                <UFormGroup
                  label="Full Name"
                  name="customerName"
                  required
                >
                  <UInput
                    v-model="formState.customerName"
                    placeholder="Enter customer name"
                  />
                </UFormGroup>

                <UFormGroup
                  label="Email"
                  name="customerEmail"
                  required
                >
                  <UInput
                    v-model="formState.customerEmail"
                    type="email"
                    placeholder="customer@example.com"
                  />
                </UFormGroup>
              </div>

              <UFormGroup
                label="Phone Number"
                name="customerPhone"
              >
                <UInput
                  v-model="formState.customerPhone"
                  type="tel"
                  placeholder="07123 456789"
                />
              </UFormGroup>
            </div>

            <!-- Ticket Selection -->
            <div
              v-if="selectedPerformance"
              class="form-section full-width"
            >
              <h3 class="section-title">
                Ticket Selection
              </h3>

              <div class="ticket-types">
                <div
                  v-for="(ticket, index) in formState.tickets"
                  :key="ticket.ticketTypeId"
                  class="ticket-row"
                >
                  <div class="ticket-info">
                    <div class="ticket-name">
                      {{ getTicketTypeName(ticket.ticketTypeId) }}
                    </div>
                    <div class="ticket-price">
                      £{{ getTicketTypePrice(ticket.ticketTypeId) }}
                    </div>
                  </div>

                  <div class="ticket-quantity">
                    <UButton
                      icon="i-lucide-minus"
                      color="neutral"
                      variant="outline"
                      size="sm"
                      :disabled="ticket.quantity === 0"
                      @click="decrementTicket(index)"
                    />

                    <span class="quantity-value">{{ ticket.quantity }}</span>

                    <UButton
                      icon="i-lucide-plus"
                      color="neutral"
                      variant="outline"
                      size="sm"
                      @click="incrementTicket(index)"
                    />
                  </div>
                </div>
              </div>

              <div class="total-section">
                <div class="total-label">
                  Total Amount
                </div>
                <div class="total-value">
                  £{{ calculateTotal() }}
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div class="form-section full-width">
              <h3 class="section-title">
                Additional Information
              </h3>

              <UFormGroup
                label="Customer Notes"
                name="notes"
                hint="Any special requests from the customer"
              >
                <UTextarea
                  v-model="formState.notes"
                  placeholder="Enter any customer notes or special requests..."
                  :rows="3"
                />
              </UFormGroup>

              <UFormGroup
                label="Admin Notes"
                name="adminNotes"
                hint="Internal notes (not visible to customer)"
              >
                <UTextarea
                  v-model="formState.adminNotes"
                  placeholder="Enter internal notes..."
                  :rows="3"
                />
              </UFormGroup>
            </div>

            <!-- Payment Status -->
            <div class="form-section full-width">
              <h3 class="section-title">
                Payment Status
              </h3>

              <UFormGroup
                label="Status"
                name="status"
              >
                <USelect
                  v-model="formState.status"
                  :options="statusOptions"
                />
              </UFormGroup>
            </div>
          </div>

          <div class="form-actions">
            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              @click="resetForm"
            >
              Reset
            </UButton>

            <UButton
              type="submit"
              icon="i-lucide-check"
              color="primary"
              :loading="isSubmitting"
              :disabled="!canSubmit"
            >
              Create Reservation
            </UButton>
          </div>
        </UForm>
      </UCard>

      <!-- API Not Implemented Notice -->
      <UAlert
        icon="i-lucide-info"
        color="info"
        variant="soft"
        title="Development Notice"
        description="The walk-in sales API endpoint is not yet implemented. This form is ready and will work once the /api/v1/foh/reservations POST endpoint is completed."
        class="mt-6"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role-redirect'],
  layout: 'admin',
  title: 'Walk-in Sales',
})

interface Performance {
  id: string
  startDateTime: string
  endDateTime?: string
  maxCapacity: number
  show: {
    title: string
  } | null
  venue: {
    name: string
  } | null
  reservationSummary: {
    totalTicketsReserved: number
  }
}

interface _SelectedPerformance extends Performance {
  availableSeats: number
}

// Fetch today's performances for dropdown
const { data: performancesData, pending: loadingPerformances } = await useFetch(
  '/api/v1/foh/performances/today',
  {
    key: 'foh-walkin-performances',
  },
)

const error = ref<string | null>(null)
const isSubmitting = ref(false)
const selectedPerformance = ref<(Performance & { availableSeats: number }) | null>(null)

// Form state
const formState = ref({
  performanceId: '',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  tickets: [] as Array<{ ticketTypeId: string, quantity: number }>,
  notes: '',
  adminNotes: '',
  status: 'PENDING_COLLECTION',
})

// Performance options for dropdown
const performanceOptions = computed(() => {
  if (!performancesData.value?.data?.performances)
    return []

  return performancesData.value.data.performances.map(perf => ({
    value: perf.id,
    label: `${perf.show?.title ?? 'Unknown'} - ${formatTime(perf.startDateTime)} at ${perf.venue?.name ?? 'Unknown'}`,
  }))
})

// Status options
const statusOptions = [
  { value: 'PENDING_COLLECTION', label: 'Pending Collection' },
  { value: 'COLLECTED', label: 'Collected (Already Paid)' },
  { value: 'PURCHASED_ON_DOOR', label: 'Purchased on Door' },
]

// Computed
const canSubmit = computed(() => {
  return (
    formState.value.performanceId
    && formState.value.customerName
    && formState.value.customerEmail
    && formState.value.tickets.some(t => t.quantity > 0)
  )
})

// Helpers
function formatTime(dateString: string): string {
  return new Date(dateString).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function onPerformanceChange() {
  if (!performancesData.value?.data?.performances)
    return

  const performance = performancesData.value.data.performances.find(
    p => p.id === formState.value.performanceId,
  )

  if (performance) {
    selectedPerformance.value = {
      ...performance,
      availableSeats: performance.maxCapacity - (performance.reservationSummary?.totalTicketsReserved || 0),
    }

    // Initialize ticket types (would come from API in real implementation)
    formState.value.tickets = [
      { ticketTypeId: 'standard', quantity: 0 },
      { ticketTypeId: 'concession', quantity: 0 },
      { ticketTypeId: 'member', quantity: 0 },
    ]
  }
}

function getTicketTypeName(ticketTypeId: string): string {
  const names: Record<string, string> = {
    standard: 'Standard',
    concession: 'Concession',
    member: 'Member',
  }
  return names[ticketTypeId] || ticketTypeId
}

function getTicketTypePrice(ticketTypeId: string): string {
  // Placeholder prices - would come from API
  const prices: Record<string, string> = {
    standard: '10.00',
    concession: '8.00',
    member: '6.00',
  }
  return prices[ticketTypeId] || '0.00'
}

function incrementTicket(index: number) {
  const ticket = formState.value.tickets[index]
  if (ticket) {
    ticket.quantity++
  }
}

function decrementTicket(index: number) {
  const ticket = formState.value.tickets[index]
  if (ticket && ticket.quantity > 0) {
    ticket.quantity--
  }
}

function calculateTotal(): string {
  const prices: Record<string, number> = {
    standard: 1000,
    concession: 800,
    member: 600,
  }

  const totalPence = formState.value.tickets.reduce((sum, ticket) => {
    return sum + ((prices[ticket.ticketTypeId] || 0) * ticket.quantity)
  }, 0)

  return (totalPence / 100).toFixed(2)
}

function resetForm() {
  formState.value = {
    performanceId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    tickets: [],
    notes: '',
    adminNotes: '',
    status: 'PENDING_COLLECTION',
  }
  selectedPerformance.value = null
  error.value = null
}

async function handleSubmit() {
  error.value = null
  isSubmitting.value = true

  try {
    // Filter out tickets with 0 quantity
    const ticketsToReserve = formState.value.tickets.filter(t => t.quantity > 0)

    const { data, error: submitError } = await useFetch('/api/v1/foh/reservations', {
      method: 'POST',
      body: {
        performanceId: formState.value.performanceId,
        customerName: formState.value.customerName,
        customerEmail: formState.value.customerEmail,
        customerPhone: formState.value.customerPhone || undefined,
        tickets: ticketsToReserve,
        notes: formState.value.notes || undefined,
        adminNotes: formState.value.adminNotes || undefined,
        status: formState.value.status,
      },
    })

    if (submitError.value) {
      error.value = submitError.value.statusMessage || 'Failed to create reservation'
    }
    else if (data.value) {
      // Success - navigate to the reservation detail page or show confirmation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const responseData = data.value as any
      if (responseData.reservation?.id) {
        await navigateTo(`/admin/reservations/${responseData.reservation.id}`)
      }
    }
  }
  catch {
    error.value = 'An unexpected error occurred'
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.foh-walkin {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.foh-walkin__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.foh-walkin__title {
  font-size: 28px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0 0 4px 0;
}

.foh-walkin__subtitle {
  font-size: 16px;
  color: var(--secondary-text-color);
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

.form-grid {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.full-width {
  grid-column: 1 / -1;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--border-color);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.performance-info {
  margin-top: 16px;
  padding: 16px;
  background: var(--hover-color);
  border-radius: 8px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--secondary-text-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-text-color);
}

.ticket-types {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.ticket-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: var(--hover-color);
  border-radius: 8px;
}

.ticket-info {
  flex: 1;
}

.ticket-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin-bottom: 2px;
}

.ticket-price {
  font-size: 14px;
  color: var(--primary-color);
  font-weight: 600;
}

.ticket-quantity {
  display: flex;
  align-items: center;
  gap: 12px;
}

.quantity-value {
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-text-color);
  min-width: 30px;
  text-align: center;
}

.total-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: var(--primary-color);
  color: white;
  border-radius: 8px;
  margin-top: 8px;
}

.total-label {
  font-size: 16px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.total-value {
  font-size: 28px;
  font-weight: 700;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 24px;
  margin-top: 24px;
  border-top: 2px solid var(--border-color);
}

@media (max-width: 768px) {
  .foh-walkin {
    padding: 16px;
  }

  .foh-walkin__header {
    flex-direction: column;
  }

  .form-row,
  .info-grid {
    grid-template-columns: 1fr;
  }

  .ticket-row {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .ticket-quantity {
    justify-content: center;
  }
}
</style>
