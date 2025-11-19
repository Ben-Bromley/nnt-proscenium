<template>
  <div class="venues-table-container">
    <div class="page-header">
      <h1 class="page-title">
        Venues Management
      </h1>
      <div class="page-actions">
        <UIButton
          variant="primary"
          @click="navigateTo('/admin/venues/new')"
        >
          Add New Venue
        </UIButton>
        <UIButton
          variant="secondary"
          @click="navigateTo('/admin/venues/features')"
        >
          Manage Features
        </UIButton>
      </div>
    </div>

    <DataTable
      ref="dataTable"
      api-endpoint="/api/v1/admin/venues"
      :columns="columns"
      :filters="filters"
      search-placeholder="Search venues by name or address..."
      empty-message="No venues found"
      default-sort-by="createdAt"
      default-sort-order="desc"
      :default-per-page="10"
      enable-selection
    >
      <template #actions="{ row }">
        <div class="flex gap-2">
          <UButton
            icon="i-lucide-eye"
            color="neutral"
            variant="ghost"
            size="sm"
            aria-label="View venue"
            @click="navigateTo(`/admin/venues/${row.original.id}`)"
          />
          <UButton
            icon="i-lucide-edit"
            color="neutral"
            variant="ghost"
            size="sm"
            aria-label="Edit venue"
            @click="navigateTo(`/admin/venues/${row.original.id}/edit`)"
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
  title: 'Venues',
})

// Define columns for the venues table
const columns = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
  },
  {
    key: 'address',
    label: 'Address',
    sortable: false,
    render: (value: unknown): string => {
      return String(value || 'No address provided')
    },
  },
  {
    key: 'capacity',
    label: 'Capacity',
    sortable: true,
    render: (value: unknown): string => {
      return value ? `${value} people` : 'Not specified'
    },
  },
  {
    key: 'features',
    label: 'Features',
    sortable: false,
    render: (value: unknown): string => {
      if (!value || !Array.isArray(value) || value.length === 0) return 'No features'
      return value.map((feature: { name: string }) => feature.name).join(', ')
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

// Define filters for the venues table
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
.venues-table-container {
  padding: 24px;
  max-width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
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
}

@media (max-width: 768px) {
  .venues-table-container {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-actions {
    width: 100%;
    flex-direction: column;
  }
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .admin-page__title {
    font-size: 2rem;
  }

  .admin-page__subtitle {
    font-size: 1rem;
  }

  .admin-page__content {
    padding: var(--spacing-lg);
  }
}

@media (max-width: 480px) {
  .admin-page__title {
    font-size: 1.75rem;
  }

  .admin-page__subtitle {
    font-size: 0.9rem;
  }
}
</style>
