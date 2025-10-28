<template>
  <div class="performances-management">
    <header class="performances-management__header">
      <div class="performances-management__title-section">
        <h1 class="performances-management__title">
          Performances Management
        </h1>
        <UIButton
          variant="primary"
          @click="navigateTo('/admin/performances/new')"
        >
          Schedule New Performance
        </UIButton>
      </div>
    </header>

    <div class="performances-management__content">
      <DataTable
        api-endpoint="/api/admin/performances"
        :columns="columns"
        :filters="filters"
        search-placeholder="Search performances by show, venue, or date..."
        empty-message="No performances found"
        default-sort-by="startDateTime"
        default-sort-order="asc"
        :default-per-page="25"
      >
        <template #actions="{ row }">
          <UButton
            icon="i-lucide-eye"
            color="neutral"
            variant="ghost"
            size="sm"
            aria-label="View performance"
            @click="navigateTo(`/admin/performances/${row.original.id}`)"
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
  title: 'Performances Management',
})

// Table configuration
const columns = [
  {
    key: 'title',
    label: 'Title',
    sortable: true,
  },
  {
    key: 'show.title',
    label: 'Show',
    sortable: false,
    render: (value: unknown): string => {
      return value ? String(value) : '-'
    },
  },
  {
    key: 'venue.name',
    label: 'Venue',
    sortable: false,
    render: (value: unknown): string => {
      return value ? String(value) : '-'
    },
  },
  {
    key: 'startDateTime',
    label: 'Date & Time',
    sortable: true,
    render: (value: unknown): string => {
      if (!value) return '-'
      const date = new Date(value as string)
      return date.toLocaleString()
    },
  },
  {
    key: 'type',
    label: 'Type',
    sortable: false,
    render: (value: unknown): string => {
      return String(value || '-').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    },
  },
  {
    key: 'statistics.totalReserved',
    label: 'Reserved',
    sortable: false,
    render: (value: unknown): string => {
      return value !== null && value !== undefined ? String(value) : '0'
    },
  },
  {
    key: 'maxCapacity',
    label: 'Capacity',
    sortable: false,
    render: (value: unknown): string => {
      if (!value) return '-'
      return Number(value) === -1 ? 'Unlimited' : String(value)
    },
  },
  {
    key: 'status',
    label: 'Status',
    sortable: false,
    render: (value: unknown): string => {
      return String(value || '-').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
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
      { value: 'SCHEDULED', label: 'Scheduled' },
      { value: 'ON_SALE', label: 'On Sale' },
      { value: 'RESTRICTED', label: 'Restricted' },
      { value: 'CLOSED', label: 'Closed' },
      { value: 'SOLD_OUT', label: 'Sold Out' },
      { value: 'CANCELLED', label: 'Cancelled' },
      { value: 'PAST', label: 'Past' },
    ],
  },
  {
    key: 'upcomingOnly',
    label: 'Show Only',
    type: 'select' as const,
    options: [
      { value: 'true', label: 'Upcoming Only' },
      { value: 'false', label: 'All Performances' },
    ],
  },
]
</script>

<style scoped>
.performances-management {
  padding: 24px;
}

.performances-management__header {
  margin-bottom: 32px;
}

.performances-management__title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.performances-management__title {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0;
}

.performances-management__content {
  background: var(--surface-color);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .performances-management {
    padding: 16px;
  }

  .performances-management__title-section {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
}
</style>
