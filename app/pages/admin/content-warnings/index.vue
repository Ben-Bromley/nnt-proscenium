<template>
  <div class="content-warnings-table-container">
    <div class="page-header">
      <h1 class="page-title">
        Content Warnings Management
      </h1>
      <div class="page-actions">
        <UIButton
          variant="primary"
          @click="navigateTo('/admin/content-warnings/new')"
        >
          Add New Content Warning
        </UIButton>
      </div>
    </div>

    <DataTable
      ref="dataTable"
      api-endpoint="/api/admin/content-warnings"
      :columns="columns"
      :filters="filters"
      search-placeholder="Search content warnings by name or description..."
      empty-message="No content warnings found"
      default-sort-by="createdAt"
      default-sort-order="desc"
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
            aria-label="View content warning"
            @click="navigateTo(`/admin/content-warnings/${row.original.id}`)"
          />
          <UButton
            icon="i-lucide-edit"
            color="neutral"
            variant="ghost"
            size="sm"
            aria-label="Edit content warning"
            @click="navigateTo(`/admin/content-warnings/${row.original.id}/edit`)"
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
  title: 'Content Warnings',
})

// Define columns for the content warnings table
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
      if (!value) return 'No description'
      return String(value).length > 100
        ? String(value).substring(0, 100) + '...'
        : String(value)
    },
  },
  {
    key: '_count',
    label: 'Shows Using',
    sortable: true,
    render: (value: unknown): string => {
      const count = (value as { shows?: number })?.shows || 0
      return count === 1 ? '1 show' : `${count} shows`
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
    key: 'updatedAt',
    label: 'Updated',
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

// Define filters for the content warnings table
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
  {
    key: 'hasShows',
    label: 'Usage',
    type: 'select' as const,
    options: [
      { value: 'true', label: 'Used by shows' },
      { value: 'false', label: 'Not used' },
    ],
  },
]
</script>

<style scoped>
.content-warnings-table-container {
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
  .content-warnings-table-container {
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
