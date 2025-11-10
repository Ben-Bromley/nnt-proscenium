<template>
  <div class="ticket-types-table-container">
    <div class="page-header">
      <h1 class="page-title">
        Ticket Types Management
      </h1>
      <div class="page-actions">
        <UIButton
          variant="primary"
          @click="navigateTo('/admin/tickets/new')"
        >
          Add New Ticket Type
        </UIButton>
      </div>
    </div>

    <DataTable
      ref="dataTable"
      api-endpoint="/api/v1/admin/tickets"
      :columns="columns"
      :filters="filters"
      search-placeholder="Search ticket types by name, description, or price..."
      empty-message="No ticket types found"
      default-sort-by="sortOrder"
      default-sort-order="asc"
      :default-per-page="25"
      enable-selection
    >
      <template #actions="{ row }">
        <div class="flex gap-2">
          <UButton
            icon="i-lucide-eye"
            color="neutral"
            variant="ghost"
            size="sm"
            aria-label="View ticket type"
            @click="navigateTo(`/admin/tickets/${row.original.id}`)"
          />
          <UButton
            icon="i-lucide-edit"
            color="neutral"
            variant="ghost"
            size="sm"
            aria-label="Edit ticket type"
            @click="navigateTo(`/admin/tickets/${row.original.id}/edit`)"
          />
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
// Require admin access
definePageMeta({
  middleware: 'admin',
  layout: 'admin',
  title: 'Ticket Types',
})

// Define columns for the ticket types table
const columns = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
  },
  {
    key: 'description',
    label: 'Description',
    sortable: false,
    render: (value: unknown): string => {
      return value ? String(value) : 'No description'
    },
  },
  {
    key: 'defaultPrice',
    label: 'Default Price',
    sortable: true,
    render: (value: unknown): string => {
      const price = Number(value)
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
      }).format(price)
    },
  },
  {
    key: 'sortOrder',
    label: 'Sort Order',
    sortable: true,
    render: (value: unknown): string => {
      return value !== null && value !== undefined ? String(value) : 'Auto'
    },
  },
  {
    key: 'isActive',
    label: 'Status',
    sortable: true,
    render: (value: unknown): string => {
      return value ? 'Active' : 'Inactive'
    },
  },
  {
    key: 'createdAt',
    label: 'Created',
    sortable: true,
    render: (value: unknown): string => {
      if (!value) return '-'
      const date = new Date(value as string)
      return date.toLocaleDateString()
    },
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
  },
]

// Define filters for the ticket types table
const filters = [
  {
    key: 'isActive',
    label: 'Status',
    type: 'select' as const,
    options: [
      { value: 'true', label: 'Active' },
      { value: 'false', label: 'Inactive' },
    ],
  },
]
</script>

<style scoped>
.ticket-types-table-container {
  padding: 24px;
  max-width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0;
}

.page-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .ticket-types-table-container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
