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
      api-endpoint="/api/admin/tickets"
      :columns="columns"
      :filters="filters"
      search-placeholder="Search ticket types by name, description, or price..."
      empty-message="No ticket types found"
      default-sort-by="sortOrder"
      default-sort-order="asc"
      :default-per-page="25"
      enable-selection
    />
  </div>
</template>

<script setup lang="ts">
import type { Column, Filter } from '~/components/table/types'
import { CommonRenderers } from '~/components/table/types'
import TableActions from '~/components/table/TableActions.vue'

// Require admin access
definePageMeta({
  middleware: 'admin',
  layout: 'admin',
  title: 'Ticket Types',
})

// Define columns for the ticket types table
const columns: Column[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
  },
  {
    key: 'description',
    label: 'Description',
    sortable: false,
    render: (value): string => {
      return value ? String(value) : 'No description'
    },
  },
  {
    key: 'defaultPrice',
    label: 'Default Price',
    sortable: true,
    render: (value): string => {
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
    render: (value): string => {
      return value !== null && value !== undefined ? String(value) : 'Auto'
    },
  },
  {
    key: 'isActive',
    label: 'Status',
    sortable: true,
    render: (value): string => {
      return value ? 'Active' : 'Inactive'
    },
  },
  {
    key: 'createdAt',
    label: 'Created',
    sortable: true,
    render: CommonRenderers.date,
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
    component: defineComponent({
      props: {
        row: {
          type: Object,
          required: true,
        },
        value: {
          type: null,
          required: false,
        },
      },
      setup(props) {
        const ticketTypeActions = [
          {
            key: 'view',
            label: 'View',
            variant: 'primary' as const,
            path: '/admin/tickets/{id}',
          },
          {
            key: 'edit',
            label: 'Edit',
            variant: 'secondary' as const,
            path: '/admin/tickets/{id}/edit',
          },
        ]

        return () => h(TableActions, {
          row: props.row,
          value: props.value,
          actions: ticketTypeActions,
        })
      },
    }),
  },
]

// Define filters for the ticket types table
const filters: Filter[] = [
  {
    key: 'isActive',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'true', label: 'Active' },
      { value: 'false', label: 'Inactive' },
    ],
  },
  {
    key: 'minPrice',
    label: 'Min Price (£)',
    type: 'number',
  },
  {
    key: 'maxPrice',
    label: 'Max Price (£)',
    type: 'number',
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
