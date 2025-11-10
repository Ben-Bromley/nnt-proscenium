<template>
  <div class="users-table-container">
    <h1 class="page-title">
      Users Management
    </h1>

    <DataTable
      ref="dataTable"
      api-endpoint="/api/v1/admin/users"
      :columns="columns"
      :filters="filters"
      search-placeholder="Search users by email, name, or student ID..."
      empty-message="No users found"
      default-sort-by="createdAt"
      default-sort-order="desc"
      :default-per-page="10"
      enable-selection
    >
      <!-- Bulk actions -->
      <template #bulk-actions="{ selectedRows, clearSelection }">
        <span class="text-sm text-muted">
          {{ selectedRows.length }} selected
        </span>
        <UButton
          color="error"
          variant="ghost"
          size="sm"
          @click="handleBulkDelete(selectedRows, clearSelection)"
        >
          Delete
        </UButton>
      </template>

      <!-- Row actions -->
      <template #actions="{ row }">
        <div class="flex gap-2">
          <UButton
            icon="i-lucide-eye"
            color="neutral"
            variant="ghost"
            size="sm"
            aria-label="View user"
            @click="navigateTo(`/admin/users/${row.original.id}`)"
          />
          <UButton
            icon="i-lucide-edit"
            color="neutral"
            variant="ghost"
            size="sm"
            aria-label="Edit user"
            @click="navigateTo(`/admin/users/${row.original.id}/edit`)"
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
})

interface UserRow {
  id: string | number
  email: string
  studentId?: string
  profile?: {
    name?: string
  }
  roles?: string[]
  membership?: {
    type?: string
  }
}

// Define columns for the users table
const columns = [
  {
    key: 'profile.name',
    label: 'Name',
    sortable: true,
    render: (value: unknown, row: UserRow): string => {
      return String(value || row.email || 'No name')
    },
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
  },
  {
    key: 'studentId',
    label: 'Student ID',
    sortable: true,
    render: (value: unknown): string => {
      return String(value || '-')
    },
  },
  {
    key: 'roles',
    label: 'Roles',
    sortable: false,
    render: (value: unknown): string => {
      if (!value || !Array.isArray(value) || value.length === 0) return 'User'
      return value.map(role => role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()).join(', ')
    },
  },
  {
    key: 'membership.type',
    label: 'Membership',
    sortable: true,
    render: (value: unknown): string => {
      if (!value || value === 'UNKNOWN') return 'Not Set'
      return String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase()
    },
  },
  {
    key: 'actions',
    label: 'Actions',
    sortable: false,
  },
]

// Define filters for the users table
const filters = [
  {
    key: 'role',
    label: 'Role',
    type: 'select' as const,
    options: [
      { value: 'ADMIN', label: 'Admin' },
      { value: 'MANAGER', label: 'Manager' },
      { value: 'TRAINER', label: 'Trainer' },
    ],
  },
  {
    key: 'membershipType',
    label: 'Membership',
    type: 'select' as const,
    options: [
      { value: 'FULL', label: 'Full' },
      { value: 'ASSOCIATE', label: 'Associate' },
      { value: 'FELLOW', label: 'Fellow' },
      { value: 'ALUMNI', label: 'Alumni' },
      { value: 'GUEST', label: 'Guest' },
      { value: 'UNKNOWN', label: 'Unknown' },
    ],
  },
]

// Handle bulk delete action TODO: kinda all a placeholder for now
async function handleBulkDelete(selectedRows: (UserRow | undefined)[], clearSelection: () => void) {
  const validRows = selectedRows.filter((row): row is UserRow => row !== undefined)

  if (validRows.length === 0) return

  if (!confirm(`Are you sure you want to delete ${validRows.length} user(s)?`)) {
    return
  }

  try {
    // TODO: Implement bulk delete API call
    // Example:
    // const userIds = validRows.map(user => user.id)
    // await $fetch('/api/v1/admin/users/bulk-delete', {
    //   method: 'POST',
    //   body: { userIds }
    // })

    console.log('Delete users:', validRows.map(user => user.id))

    // Clear selection after deletion
    clearSelection()

    // Refresh the table (DataTable component will handle the API call)
    // You can add a ref to DataTable and call refresh() if needed
  }
  catch (error) {
    console.error('Failed to delete users:', error)
    // TODO: Add proper error handling/notification
  }
}
</script>

<style scoped>
.users-table-container {
  padding: 24px;
  max-width: 100%;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin-bottom: 24px;
}

@media (max-width: 1024px) {
  .users-table-container {
    padding: 16px;
  }
}
</style>
