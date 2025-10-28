<template>
  <div class="foh-reservations">
    <header class="foh-reservations__header">
      <div>
        <h1 class="foh-reservations__title">
          Collect Tickets
        </h1>
        <div class="foh-reservations__subtitle">
          Manage and collect reservations for today's performances
        </div>
      </div>

      <div class="foh-reservations__actions">
        <UButton
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          @click="navigateTo('/admin/foh')"
        >
          Back to Dashboard
        </UButton>
      </div>
    </header>

    <div class="foh-reservations__content">
      <DataTable
        api-endpoint="/api/foh/reservations"
        :columns="columns"
        :filters="filters"
        :default-filters="{ today: 'true' }"
        search-placeholder="Search by reservation code, customer name, or email..."
        empty-message="No reservations found"
        default-sort-by="createdAt"
        default-sort-order="desc"
        :default-per-page="25"
      >
        <template #actions="{ row }">
          <div class="action-buttons">
            <UButton
              v-if="row.original.status === 'PENDING_COLLECTION'"
              icon="i-lucide-banknote"
              color="success"
              size="sm"
              @click="collectPayment(row.original)"
            >
              Collect
            </UButton>

            <UButton
              icon="i-lucide-eye"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="navigateTo(`/admin/reservations/${row.original.id}`)"
            >
              View
            </UButton>
          </div>
        </template>
      </DataTable>
    </div>

    <!-- Collect Payment Modal -->
    <UModal v-model="isCollectModalOpen">
      <UCard>
        <template #header>
          <h3 class="modal-title">
            Collect Payment
          </h3>
        </template>

        <div
          v-if="selectedReservation"
          class="modal-content"
        >
          <div class="reservation-summary">
            <div class="summary-row">
              <span class="summary-label">Reservation Code</span>
              <span class="summary-value">{{ selectedReservation.reservationCode }}</span>
            </div>

            <div class="summary-row">
              <span class="summary-label">Customer</span>
              <span class="summary-value">{{ selectedReservation.customerName }}</span>
            </div>

            <div class="summary-row">
              <span class="summary-label">Performance</span>
              <span class="summary-value">
                {{ selectedReservation.performance?.show?.title || 'N/A' }}
                <br>
                <span class="summary-subtitle">
                  {{ selectedReservation.performance?.startDateTime ? formatDateTime(selectedReservation.performance.startDateTime) : 'N/A' }}
                </span>
              </span>
            </div>

            <div class="summary-row summary-row--total">
              <span class="summary-label">Total Amount</span>
              <span class="summary-value summary-value--large">
                £{{ formatPrice(selectedReservation.totalPrice) }}
              </span>
            </div>
          </div>

          <UAlert
            v-if="collectError"
            icon="i-lucide-alert-circle"
            color="error"
            variant="soft"
            :title="collectError"
            class="mt-4"
          />
        </div>

        <template #footer>
          <div class="modal-actions">
            <UButton
              color="neutral"
              variant="ghost"
              @click="closeCollectModal"
            >
              Cancel
            </UButton>

            <UButton
              icon="i-lucide-check"
              color="success"
              :loading="isCollecting"
              @click="confirmCollectPayment"
            >
              Confirm Collection
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role-redirect'],
  layout: 'admin',
  title: 'Collect Tickets',
})

const { formatDateTime } = useFormatters()

interface Reservation {
  id: string
  reservationCode: string
  customerName: string
  customerEmail: string
  totalPrice: number
  status: string
  performance?: {
    startDateTime: string
    show?: {
      title: string
    }
  }
}

// Modal state
const isCollectModalOpen = ref(false)
const selectedReservation = ref<Reservation | null>(null)
const isCollecting = ref(false)
const collectError = ref<string | null>(null)

// Table configuration
const columns = [
  {
    key: 'reservationCode',
    label: 'Code',
    sortable: false,
  },
  {
    key: 'customerName',
    label: 'Customer',
    sortable: true,
  },
  {
    key: 'customerEmail',
    label: 'Email',
    sortable: false,
  },
  {
    key: 'performance.show.title',
    label: 'Show',
    sortable: false,
    render: (value: unknown): string => {
      return value ? String(value) : '-'
    },
  },
  {
    key: 'performance.startDateTime',
    label: 'Performance',
    sortable: false,
    render: (value: unknown): string => {
      if (!value)
        return '-'
      return formatDateTime(value as string)
    },
  },
  {
    key: 'totalPrice',
    label: 'Total',
    sortable: true,
    render: (value: unknown): string => {
      if (!value)
        return '£0.00'
      return `£${(Number(value) / 100).toFixed(2)}`
    },
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
  },
]

// Define filters
const filters = [
  {
    key: 'status',
    label: 'Status',
    type: 'select' as const,
    options: [
      { value: 'PENDING_COLLECTION', label: 'Pending Collection' },
      { value: 'COLLECTED', label: 'Collected' },
      { value: 'PURCHASED_ON_DOOR', label: 'Purchased on Door' },
      { value: 'CANCELLED_BY_CUSTOMER', label: 'Cancelled by Customer' },
      { value: 'CANCELLED_BY_ADMIN', label: 'Cancelled by Admin' },
      { value: 'NO_SHOW', label: 'No Show' },
      { value: 'EXPIRED', label: 'Expired' },
    ],
  },
  {
    key: 'today',
    label: 'Date Filter',
    type: 'select' as const,
    options: [
      { value: 'true', label: 'Today Only' },
      { value: 'false', label: 'All Dates' },
    ],
  },
  {
    key: 'upcoming',
    label: 'Performance Type',
    type: 'select' as const,
    options: [
      { value: 'true', label: 'Upcoming Only' },
      { value: 'false', label: 'All Performances' },
    ],
  },
]

// Status helpers - kept for future use
function _getStatusColor(status: string): string {
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

function formatPrice(pence: number): string {
  return (pence / 100).toFixed(2)
}

// Collection actions
function collectPayment(reservation: Reservation | Record<string, unknown>) {
  selectedReservation.value = reservation as Reservation
  collectError.value = null
  isCollectModalOpen.value = true
}

function closeCollectModal() {
  isCollectModalOpen.value = false
  selectedReservation.value = null
  collectError.value = null
}

async function confirmCollectPayment() {
  if (!selectedReservation.value)
    return

  isCollecting.value = true
  collectError.value = null

  try {
    const { error: updateError } = await useFetch(
      `/api/foh/reservations/${selectedReservation.value.id}/collect`,
      {
        method: 'POST',
      },
    )

    if (updateError.value) {
      collectError.value = updateError.value.statusMessage || 'Failed to collect payment'
    }
    else {
      // Refresh the table data
      await refreshNuxtData('datatable-/api/foh/reservations')
      closeCollectModal()
    }
  }
  catch {
    collectError.value = 'An unexpected error occurred'
  }
  finally {
    isCollecting.value = false
  }
}
</script>

<style scoped>
.foh-reservations {
  padding: 24px;
  max-width: 1600px;
  margin: 0 auto;
}

.foh-reservations__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 24px;
}

.foh-reservations__title {
  font-size: 28px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0 0 4px 0;
}

.foh-reservations__subtitle {
  font-size: 16px;
  color: var(--secondary-text-color);
}

.foh-reservations__actions {
  display: flex;
  gap: 12px;
}

.foh-reservations__content {
  background: var(--surface-color);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.reservation-code {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: var(--primary-color);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.modal-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0;
}

.modal-content {
  padding: 8px 0;
}

.reservation-summary {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.summary-row--total {
  border-top: 2px solid var(--border-color);
  border-bottom: none;
  padding-top: 16px;
  margin-top: 8px;
}

.summary-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--secondary-text-color);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--primary-text-color);
  text-align: right;
}

.summary-value--large {
  font-size: 24px;
  color: var(--primary-color);
}

.summary-subtitle {
  font-size: 13px;
  color: var(--secondary-text-color);
  font-weight: 400;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 768px) {
  .foh-reservations {
    padding: 16px;
  }

  .foh-reservations__header {
    flex-direction: column;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
