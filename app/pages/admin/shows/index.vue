<template>
  <div class="shows-management">
    <header class="shows-management__header">
      <div class="shows-management__title-section">
        <h1 class="shows-management__title">
          Shows Management
        </h1>
        <UIButton
          variant="primary"
          @click="navigateTo('/admin/shows/new')"
        >
          Create New Show
        </UIButton>
      </div>
    </header>

    <div class="shows-management__content">
      <DataTable
        ref="dataTable"
        api-endpoint="/api/admin/shows"
        :columns="columns"
        :filters="filters"
        search-placeholder="Search shows by title or description..."
        empty-message="No shows found"
        default-sort-by="sortOrder"
        default-sort-order="asc"
        :default-per-page="20"
        enable-selection
      >
        <template #actions="{ row }">
          <div class="flex gap-2">
            <UButton
              icon="i-lucide-eye"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="View show"
              @click="navigateTo(`/admin/shows/${row.original.id}`)"
            />
            <UButton
              icon="i-lucide-edit"
              color="neutral"
              variant="ghost"
              size="sm"
              aria-label="Edit show"
              @click="navigateTo(`/admin/shows/${row.original.id}/edit`)"
            />
          </div>
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
  title: 'Shows Management',
})

const filters = [
  {
    key: 'status',
    label: 'Status',
    type: 'select' as const,
    options: [
      { label: 'Draft', value: 'draft' },
      { label: 'Announced', value: 'announced' },
      { label: 'Booking Open', value: 'booking_open' },
      { label: 'Sold Out', value: 'sold_out' },
      { label: 'Completed', value: 'completed' },
      { label: 'Cancelled', value: 'cancelled' },
    ],
  },
]

// Table configuration
const columns = [
  {
    key: 'title',
    label: 'Title',
    sortable: true,
  },
  {
    key: 'subtitle',
    label: 'Subtitle',
    sortable: false,
  },
  {
    key: 'venue.name',
    label: 'Venue',
    sortable: true,
  },
  {
    key: 'startDate',
    label: 'Start Date',
    sortable: true,
    render: (value: unknown): string => {
      if (!value) return '-'
      const date = new Date(value as string)
      return date.toLocaleDateString()
    },
  },
  {
    key: 'endDate',
    label: 'End Date',
    sortable: true,
    render: (value: unknown): string => {
      if (!value) return '-'
      const date = new Date(value as string)
      return date.toLocaleDateString()
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
    key: 'actions',
    label: 'Actions',
    sortable: false,
  },
]
</script>

<style scoped>
.shows-management {
  padding: 24px;
}

.shows-management__header {
  margin-bottom: 32px;
}

.shows-management__title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.shows-management__title {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0;
}

.shows-management__content {
  background: var(--surface-color);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 4px 8px;
  font-size: 12px;
  border: 1px solid var(--border-color);
  background: var(--surface-color);
  color: var(--primary-text-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: var(--primary-color);
  color: white;
}

.status-badge {
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 12px;
  text-transform: uppercase;
}

.status-draft {
  background: #f3f4f6;
  color: #6b7280;
}

.status-announced {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-booking-open {
  background: #d1fae5;
  color: #059669;
}

.status-sold-out {
  background: #fed7d7;
  color: #c53030;
}

.status-completed {
  background: #e2e8f0;
  color: #4a5568;
}

.status-cancelled {
  background: #fee2e2;
  color: #dc2626;
}

.status-unknown {
  background: #f9fafb;
  color: #374151;
}
</style>
