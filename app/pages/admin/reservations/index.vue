<template>
  <div class="reservations-management">
    <header class="reservations-management__header">
      <div class="reservations-management__title-section">
        <h1 class="reservations-management__title">
          Reservations Management
        </h1>
      </div>
    </header>

    <div class="reservations-management__content">
      <DataTable
        api-endpoint="/api/foh/reservations"
        :columns="columns"
        :filters="filters"
        search-placeholder="Search by reservation code, customer name, or email..."
        empty-message="No reservations found"
        default-sort-by="createdAt"
        default-sort-order="desc"
        :default-per-page="25"
      >
        <template #actions="{ row }">
          <UButton
            icon="i-lucide-eye"
            color="neutral"
            variant="ghost"
            size="sm"
            aria-label="View reservation"
            @click="navigateTo(`/admin/reservations/${row.original.id}`)"
          />
        </template>
      </DataTable>
    </div>
  </div>
</template>

<script setup lang="ts">
// Require admin access
definePageMeta({
  middleware: 'admin',
  layout: 'admin',
  title: 'Reservations Management',
})

const { formatDateTime } = useFormatters()

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
    label: 'Performance Date',
    sortable: false,
    render: (value: unknown): string => {
      if (!value) return '-'
      return formatDateTime(value as string)
    },
  },
  {
    key: 'totalPrice',
    label: 'Total',
    sortable: true,
    render: (value: unknown): string => {
      if (!value) return '£0.00'
      return `£${(Number(value) / 100).toFixed(2)}`
    },
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: (value: unknown): string => {
      return String(value || '-').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    },
  },
  {
    key: 'createdAt',
    label: 'Created',
    sortable: true,
    render: (value: unknown): string => {
      if (!value) return '-'
      return formatDateTime(value as string)
    },
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
    key: 'upcoming',
    label: 'Show',
    type: 'select' as const,
    options: [
      { value: 'true', label: 'Upcoming Performances' },
      { value: 'false', label: 'All Performances' },
    ],
  },
  {
    key: 'today',
    label: 'Today',
    type: 'select' as const,
    options: [
      { value: 'true', label: 'Today Only' },
      { value: 'false', label: 'All Dates' },
    ],
  },
]
</script>

<style scoped>
.reservations-management {
  padding: 24px;
}

.reservations-management__header {
  margin-bottom: 32px;
}

.reservations-management__title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.reservations-management__title {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0;
}

.reservations-management__content {
  background: var(--surface-color);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .reservations-management {
    padding: 16px;
  }

  .reservations-management__title-section {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
}
</style>
