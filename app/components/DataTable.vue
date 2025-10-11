<template>
  <div class="data-table">
    <!-- Search, Filters, and Bulk Actions -->
    <div
      v-if="showSearch || showFilters || $slots['bulk-actions']"
      class="flex items-center justify-between gap-3 py-3 border-b border-default"
    >
      <div class="flex items-center gap-3">
        <UInput
          v-if="showSearch"
          v-model="searchQuery"
          :placeholder="searchPlaceholder"
          icon="i-lucide-search"
          class="w-64"
        />

        <!-- Clear filters button -->
        <UButton
          v-if="showFilters && hasActiveFilters"
          icon="i-lucide-x"
          color="neutral"
          variant="ghost"
          aria-label="Clear filters"
          @click="handleFiltersClear"
        />
      </div>

      <div class="flex items-center gap-3">
        <!-- Bulk actions slot -->
        <div
          v-if="$slots['bulk-actions'] && hasSelectedRows"
          class="flex items-center gap-2"
        >
          <slot
            name="bulk-actions"
            :selected-rows="selectedRows"
            :clear-selection="clearSelection"
          />
        </div>

        <!-- Filter Dropdowns -->
        <template v-if="showFilters && filters.length > 0">
          <USelect
            v-for="filter in filters"
            :key="filter.key"
            v-model="filterValues[filter.key]"
            :items="filter.options || []"
            :placeholder="filter.label"
            class="w-40"
          />
        </template>
      </div>
    </div>

    <!-- Table -->
    <UTable
      ref="tableRef"
      v-model:row-selection="rowSelectionState"
      :data="(data as T[])"
      :columns="tableColumns"
      :loading="loading"
      :empty="emptyMessage"
      :ui="{
        base: 'table-fixed border-separate border-spacing-0',
        thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
        tbody: '[&>tr]:last:[&>td]:border-b-0',
        th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
        td: 'border-b border-default',
      }"
      :pagination-options="{
        manualPagination: true,
        pageCount: totalPages,
        rowCount: totalRows,
      }"
      :sorting-options="{
        manualSorting: true,
      }"
      @update:sorting="handleSortingChange"
    >
      <!-- Actions slot -->
      <template
        v-if="$slots.actions"
        #actions-cell="{ row }"
      >
        <slot
          name="actions"
          :row="row"
        />
      </template>
    </UTable>

    <!-- Pagination -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-between gap-3 px-4 py-3 border-t border-default"
    >
      <div class="text-sm text-muted">
        <template v-if="enableSelection">
          {{ selectedRows.length }} of {{ totalRows }} row(s) selected.
        </template>
      </div>

      <UPagination
        :model-value="currentPage"
        :items-per-page="perPage"
        :total="totalRows"
        @update:model-value="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, any>">
import { h } from 'vue'
import type { ColumnDef, SortingState } from '@tanstack/vue-table'
import type { Filter } from './table/types'

interface Column<TData = Record<string, unknown>> {
  key: string
  label?: string
  sortable?: boolean
  class?: string
  render?: (value: unknown, row: TData) => string | number | boolean
}

interface Props {
  apiEndpoint: string
  columns: Column<T>[]
  filters?: Filter[]
  searchPlaceholder?: string
  emptyMessage?: string
  defaultSortBy?: string
  defaultSortOrder?: 'asc' | 'desc'
  defaultPerPage?: number
  enableSelection?: boolean
  showSearch?: boolean
  showFilters?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  filters: () => [],
  searchPlaceholder: 'Search...',
  emptyMessage: 'No data available',
  defaultSortBy: 'createdAt',
  defaultSortOrder: 'desc',
  defaultPerPage: 10,
  enableSelection: false,
  showSearch: true,
  showFilters: true,
})

// Refs
const tableRef = useTemplateRef('tableRef')
const data = ref<T[]>([])
const loading = ref(false)
const totalRows = ref(0)
const totalPages = ref(0)

// Query state
const searchQuery = ref('')
const filterValues = ref<Record<string, string | number | boolean | null>>({})
const currentPage = ref(1)
const perPage = ref(props.defaultPerPage)
const sorting = ref<SortingState>([
  {
    id: props.defaultSortBy,
    desc: props.defaultSortOrder === 'desc',
  },
])

// Row selection state
const rowSelectionState = ref<Record<string, boolean>>({})

// Computed selected rows for external access
const selectedRows = computed(() => {
  return Object.keys(rowSelectionState.value)
    .filter(key => rowSelectionState.value[key])
    .map((key) => {
      const index = Number.parseInt(key, 10)
      return data.value[index]
    })
    .filter(Boolean)
})

// Check if any rows are selected
const hasSelectedRows = computed(() => {
  return selectedRows.value.length > 0
})

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return Object.values(filterValues.value).some(value =>
    value !== null && value !== undefined && value !== '',
  )
})// Build TanStack Table columns from our column definitions
const tableColumns = computed((): ColumnDef<T>[] => {
  const cols: ColumnDef<T>[] = []

  // Add selection column if enabled
  if (props.enableSelection) {
    cols.push({
      id: 'select',
      header: ({ table }) =>
        h(resolveComponent('UCheckbox'), {
          'modelValue': table.getIsSomePageRowsSelected()
            ? 'indeterminate'
            : table.getIsAllPageRowsSelected(),
          'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
            table.toggleAllPageRowsSelected(!!value),
          'aria-label': 'Select all',
        }),
      cell: ({ row }) =>
        h(resolveComponent('UCheckbox'), {
          'modelValue': row.getIsSelected(),
          'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
            row.toggleSelected(!!value),
          'aria-label': 'Select row',
        }),
      enableSorting: false,
    })
  }

  // Add data columns
  props.columns.forEach((col) => {
    const columnDef: ColumnDef<T> = {
      accessorKey: col.key,
      id: col.key,
      header: col.label || col.key,
      enableSorting: col.sortable ?? false,
      meta: col.class
        ? {
            class: {
              th: col.class,
              td: col.class,
            },
          }
        : undefined,
    }

    // Add custom cell renderer if provided
    if (col.render) {
      columnDef.cell = ({ row }) => {
        const value = row.getValue(col.key)
        return col.render!(value, row.original)
      }
    }

    cols.push(columnDef)
  })

  return cols
})

// Query parameters for API
const queryParams = computed(() => {
  const params: Record<string, string | number | boolean> = {
    page: currentPage.value,
    limit: perPage.value,
  }

  // Add sorting
  if (sorting.value.length > 0 && sorting.value[0]) {
    params.sortBy = sorting.value[0].id
    params.sortOrder = sorting.value[0].desc ? 'desc' : 'asc'
  }

  // Add search
  if (searchQuery.value) {
    params.search = searchQuery.value
  }

  // Add filters
  Object.entries(filterValues.value).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params[key] = value
    }
  })

  return params
})

// Fetch data from API
let loadingTimeout: ReturnType<typeof setTimeout> | null = null

const fetchData = async (showLoadingDelay = 150) => {
  // Clear any existing timeout
  if (loadingTimeout) {
    clearTimeout(loadingTimeout)
    loadingTimeout = null
  }

  // Set loading with delay to prevent flicker for fast requests
  loadingTimeout = setTimeout(() => {
    loading.value = true
    loadingTimeout = null
  }, showLoadingDelay)

  try {
    const response = await $fetch<ApiResponse<T[]>>(props.apiEndpoint, {
      query: queryParams.value,
    })

    if (response.success) {
      data.value = response.data || []

      if (response.pagination) {
        totalRows.value = response.pagination.total || 0
        totalPages.value = response.pagination.pages || 0
        currentPage.value = response.pagination.page || 1
      }
    }
    else {
      console.error('API returned success: false')
      data.value = []
      totalRows.value = 0
      totalPages.value = 0
    }
  }
  catch (error) {
    console.error('Failed to fetch data:', error)
    data.value = []
    totalRows.value = 0
    totalPages.value = 0
  }
  finally {
    // Clear timeout and loading state
    if (loadingTimeout) {
      clearTimeout(loadingTimeout)
      loadingTimeout = null
    }
    loading.value = false
  }
}

// Event handlers
const handleSortingChange = (newSorting: SortingState) => {
  sorting.value = newSorting
  currentPage.value = 1
  fetchData(50) // Fast operation
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchData(50) // Fast operation
}

const handleFiltersClear = () => {
  filterValues.value = {}
  currentPage.value = 1
  fetchData()
}

// Watchers
watch(searchQuery, () => {
  currentPage.value = 1
  fetchData()
})

watch(filterValues, () => {
  currentPage.value = 1
  fetchData()
}, { deep: true })

watch(() => props.apiEndpoint, () => {
  currentPage.value = 1
  fetchData()
})

// Clear selection helper
const clearSelection = () => {
  rowSelectionState.value = {}
}

// Expose for parent components
defineExpose({
  selectedRows: computed(() => selectedRows.value),
  clearSelection,
  refresh: fetchData,
  tableApi: computed(() => tableRef.value?.tableApi),
})

// Initialize
onMounted(() => {
  fetchData()
})

// Cleanup
onUnmounted(() => {
  if (loadingTimeout) {
    clearTimeout(loadingTimeout)
    loadingTimeout = null
  }
})
</script>

<style scoped>
.data-table {
  display: flex;
  flex-direction: column;
  width: 100%;
  border: 1px solid var(--ui-border-default);
  border-radius: var(--ui-radius);
  overflow: hidden;
}
</style>
