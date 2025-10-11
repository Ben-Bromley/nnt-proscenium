<template>
  <div class="reservations-management">
    <header class="reservations-management__header">
      <div class="reservations-management__title-section">
        <h1 class="reservations-management__title">
          Reservations Management
        </h1>
        <UIButton
          variant="primary"
          @click="navigateTo('/admin/reservations/new')"
        >
          Create New Reservation
        </UIButton>
      </div>
    </header>

    <div class="reservations-management__content">
      <DataTable
        api-endpoint="/api/admin/reservations"
        :columns="columns"
        :filters="filters"
        search-placeholder="Search reservations by number, show, or customer..."
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

// Table configuration
const columns = [
  {
    key: 'reservationNumber',
    label: 'Reservation #',
    sortable: true,
  },
  {
    key: 'performance.show.title',
    label: 'Show',
    sortable: true,
  },
  {
    key: 'performance.date',
    label: 'Performance Date',
    sortable: true,
  },
  {
    key: 'user.email',
    label: 'Customer',
    sortable: true,
  },
  {
    key: 'tickets',
    label: 'Tickets',
    sortable: false,
  },
  {
    key: 'totalAmount',
    label: 'Total Amount',
    sortable: true,
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
  },
  {
    key: 'createdAt',
    label: 'Created',
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
      { value: 'PENDING', label: 'Pending' },
      { value: 'CONFIRMED', label: 'Confirmed' },
      { value: 'CANCELLED', label: 'Cancelled' },
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
