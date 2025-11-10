<template>
  <div class="venue-features-container">
    <div class="page-header">
      <h1 class="page-title">
        Venue Features Management
      </h1>
      <div class="page-actions">
        <UIButton
          variant="secondary"
          @click="navigateTo('/admin/venues')"
        >
          Back to Venues
        </UIButton>
        <UIButton
          variant="primary"
          @click="navigateTo('/admin/venues/features/new')"
        >
          Add New Feature
        </UIButton>
      </div>
    </div>

    <DataTable
      ref="dataTable"
      api-endpoint="/api/v1/admin/venue-features"
      :columns="columns"
      :filters="filters"
      search-placeholder="Search features by name or description..."
      empty-message="No venue features found"
      default-sort-by="name"
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
            aria-label="View feature"
            @click="navigateTo(`/admin/venues/features/${row.original.id}`)"
          />
          <UButton
            icon="i-lucide-edit"
            color="neutral"
            variant="ghost"
            size="sm"
            aria-label="Edit feature"
            @click="navigateTo(`/admin/venues/features/${row.original.id}/edit`)"
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
  title: 'Venue Features',
})

// Define columns for the venue features table
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
      return String(value || 'No description provided')
    },
  },
  {
    key: 'icon',
    label: 'Icon',
    sortable: false,
    render: (value: unknown): string => {
      return String(value || 'No icon')
    },
  },
  {
    key: '_count',
    label: 'Used by Venues',
    sortable: false,
    render: (value: unknown): string => {
      if (!value || typeof value !== 'object' || !('venues' in value)) return 'No venues'
      const count = (value as { venues: number }).venues
      return count === 0 ? 'No venues' : `${count} venue${count === 1 ? '' : 's'}`
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

// Define filters for the venue features table
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
.venue-features-container {
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
  .venue-features-container {
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
</style>
