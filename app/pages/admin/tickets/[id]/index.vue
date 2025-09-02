<template>
  <div class="ticket-type-detail">
    <header class="ticket-type-detail__header">
      <div class="ticket-type-detail__title-section">
        <h1 class="ticket-type-detail__title">
          Ticket Type Details
        </h1>
        <div class="ticket-type-detail__actions">
          <UIButton
            variant="secondary"
            @click="navigateTo('/admin/tickets')"
          >
            Back to Ticket Types
          </UIButton>
          <UIButton
            variant="primary"
            @click="navigateTo(`/admin/tickets/${ticketTypeId}/edit`)"
          >
            Edit Ticket Type
          </UIButton>
          <UIButton
            v-if="ticketType && !ticketType.isActive"
            variant="secondary"
            :class="{ 'button--danger': true }"
            @click="showDeleteModal = true"
          >
            Delete Ticket Type
          </UIButton>
        </div>
      </div>
    </header>

    <div
      v-if="pending"
      class="ticket-type-detail__loading"
    >
      <LoadingSpinner />
    </div>

    <div
      v-else-if="error"
      class="ticket-type-detail__error"
    >
      <AppAlert type="error">
        {{ error.statusMessage || 'Failed to load ticket type details' }}
      </AppAlert>
    </div>

    <div
      v-else-if="ticketType"
      class="ticket-type-detail__content"
    >
      <!-- Ticket Type Status Cards -->
      <div class="ticket-type-detail__status-cards">
        <div class="status-card">
          <h3 class="status-card__title">
            Ticket Type Status
          </h3>
          <div class="status-card__content">
            <div class="status-item">
              <span class="status-item__label">Status:</span>
              <UIStatusBadge
                :variant="ticketTypeStatus?.active.variant"
                :label="ticketTypeStatus?.active.label"
              />
            </div>
            <div class="status-item">
              <span class="status-item__label">Default Price:</span>
              <span class="status-item__value">
                {{ formatPrice(ticketType.defaultPrice) }}
              </span>
            </div>
            <div class="status-item">
              <span class="status-item__label">Sort Order:</span>
              <span class="status-item__value">
                {{ ticketType.sortOrder ?? 'Auto' }}
              </span>
            </div>
          </div>
        </div>

        <div class="status-card">
          <h3 class="status-card__title">
            Usage Statistics
          </h3>
          <div class="status-card__content">
            <div class="status-item">
              <span class="status-item__label">Show Prices:</span>
              <span class="status-item__value">
                {{ ticketType.showPrices?.length || 0 }} show{{ (ticketType.showPrices?.length || 0) === 1 ? '' : 's' }}
              </span>
            </div>
            <div class="status-item">
              <span class="status-item__label">Performance Prices:</span>
              <span class="status-item__value">
                {{ ticketType.performancePrices?.length || 0 }} performance{{ (ticketType.performancePrices?.length || 0) === 1 ? '' : 's' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Ticket Type Information -->
      <div class="ticket-type-detail__sections">
        <!-- Basic Information -->
        <UIDetailSection title="Basic Information">
          <UIDetailGrid>
            <UIDetailItem
              label="Name"
              :value="ticketType.name"
            />
            <UIDetailItem
              label="Description"
              :value="ticketType.description || 'No description provided'"
              full-width
            />
            <UIDetailItem
              label="Default Price"
              :value="formatPrice(ticketType.defaultPrice)"
            />
            <UIDetailItem
              label="Sort Order"
              :value="ticketType.sortOrder ?? 'Automatic'"
            />
          </UIDetailGrid>
        </UIDetailSection>

        <!-- Show Pricing Overrides -->
        <UIDetailSection
          v-if="ticketType.showPrices && ticketType.showPrices.length > 0"
          title="Show Pricing Overrides"
        >
          <div class="pricing-overrides">
            <div
              v-for="showPrice in ticketType.showPrices"
              :key="showPrice.id"
              class="pricing-override"
            >
              <div class="pricing-override__info">
                <h4 class="pricing-override__title">
                  {{ showPrice.show?.title }}
                </h4>
                <div class="pricing-override__details">
                  <span class="pricing-override__price">{{ formatPrice(showPrice.price) }}</span>
                  <UIStatusBadge
                    :variant="showPrice.isActive ? 'success' : 'warning'"
                    :label="showPrice.isActive ? 'Active' : 'Inactive'"
                  />
                </div>
                <p
                  v-if="showPrice.notes"
                  class="pricing-override__notes"
                >
                  {{ showPrice.notes }}
                </p>
              </div>
            </div>
          </div>
        </UIDetailSection>

        <!-- Performance Pricing Overrides -->
        <UIDetailSection
          v-if="ticketType.performancePrices && ticketType.performancePrices.length > 0"
          title="Performance Pricing Overrides"
        >
          <div class="pricing-overrides">
            <div
              v-for="performancePrice in ticketType.performancePrices"
              :key="performancePrice.id"
              class="pricing-override"
            >
              <div class="pricing-override__info">
                <h4 class="pricing-override__title">
                  {{ performancePrice.performance?.show?.title }} - {{ performancePrice.performance?.startDateTime ? formatDateTime(performancePrice.performance.startDateTime) : 'Unknown Date' }}
                </h4>
                <div class="pricing-override__details">
                  <span class="pricing-override__price">{{ formatPrice(performancePrice.price) }}</span>
                  <UIStatusBadge
                    :variant="performancePrice.isActive ? 'success' : 'warning'"
                    :label="performancePrice.isActive ? 'Active' : 'Inactive'"
                  />
                </div>
                <p
                  v-if="performancePrice.notes"
                  class="pricing-override__notes"
                >
                  {{ performancePrice.notes }}
                </p>
              </div>
            </div>
          </div>
        </UIDetailSection>

        <!-- Metadata -->
        <UIDetailSection title="Metadata">
          <UIDetailGrid>
            <UIDetailItem
              label="Created"
              :value="formatDateTime(ticketType.createdAt)"
            />
            <UIDetailItem
              label="Last Updated"
              :value="formatDateTime(ticketType.updatedAt)"
            />
          </UIDetailGrid>
        </UIDetailSection>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <UIConfirmModal
      :show="showDeleteModal"
      :title="deleteModalConfig.title"
      :message="deleteModalConfig.message"
      :confirm-text="deleteModalConfig.confirmText"
      :cancel-text="'Cancel'"
      :variant="deleteModalConfig.variant"
      :loading="deleting"
      @confirm="handleDelete"
      @cancel="showDeleteModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { useFormatters } from '#imports'

// Require admin access
definePageMeta({
  middleware: 'admin',
  layout: 'admin',
  title: 'Ticket Type Details',
})

const route = useRoute()
const ticketTypeId = route.params.id as string

// Fetch ticket type data
interface TicketTypeDetail {
  id: string
  name: string
  description?: string | null
  defaultPrice: number
  sortOrder?: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  showPrices?: Array<{
    id: string
    price: number
    notes?: string | null
    isActive: boolean
    show?: {
      id: string
      title: string
      slug: string
    }
  }>
  performancePrices?: Array<{
    id: string
    price: number
    notes?: string | null
    isActive: boolean
    performance?: {
      id: string
      startDateTime: string
      show?: {
        id: string
        title: string
        slug: string
      }
    }
  }>
}

interface ApiResponse {
  success: boolean
  data: TicketTypeDetail
}

const { data: response, pending, error } = await useFetch<ApiResponse>(`/api/admin/tickets/${ticketTypeId}`)

// Extract ticket type from response
const ticketType = computed(() => response.value?.data)

// Delete modal state
const showDeleteModal = ref(false)
const deleting = ref(false)

const deleteModalConfig = {
  title: 'Delete Ticket Type',
  message: `Are you sure you want to delete the ticket type "${ticketType.value?.name}"? This action cannot be undone and will also delete all associated show and performance pricing overrides.`,
  confirmText: 'Delete Ticket Type',
  variant: 'danger' as const,
}

const handleDelete = async () => {
  if (!ticketType.value) return

  deleting.value = true
  try {
    await $fetch(`/api/admin/tickets/${ticketTypeId}`, {
      method: 'DELETE',
    })

    // Navigate back to ticket types list
    await navigateTo('/admin/tickets')
  }
  catch (error: unknown) {
    console.error('Failed to delete ticket type:', error)
    // Handle error - you might want to show a toast notification
    const errorMessage = error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
      ? String(error.data.message)
      : 'Failed to delete ticket type. Please try again.'
    alert(errorMessage)
  }
  finally {
    deleting.value = false
    showDeleteModal.value = false
  }
}

// Use shared formatters
const { formatDateTime } = useFormatters()

// Format price helper
const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(price)
}

// Computed status for badges
const ticketTypeStatus = computed(() => {
  if (!ticketType.value) return null

  return {
    active: {
      variant: ticketType.value.isActive ? 'success' : 'warning',
      label: ticketType.value.isActive ? 'Active' : 'Inactive',
    },
  }
})
</script>

<style scoped>
.ticket-type-detail {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.ticket-type-detail__header {
  margin-bottom: var(--spacing-xl);
}

.ticket-type-detail__title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.ticket-type-detail__title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0;
}

.ticket-type-detail__actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.ticket-type-detail__loading,
.ticket-type-detail__error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.ticket-type-detail__status-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
}

.status-card {
  background-color: var(--secondary-bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
}

.status-card__title {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0 0 var(--spacing-md) 0;
}

.status-card__content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-item__label {
  color: var(--secondary-text-color);
  font-weight: 500;
}

.status-item__value {
  color: var(--primary-text-color);
  font-weight: 600;
}

.ticket-type-detail__sections {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xl);
}

.pricing-overrides {
  display: grid;
  gap: var(--spacing-md);
}

.pricing-override {
  background-color: var(--tertiary-bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: var(--spacing-md);
}

.pricing-override__info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.pricing-override__title {
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0;
}

.pricing-override__details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--spacing-sm);
}

.pricing-override__price {
  color: var(--primary-text-color);
  font-weight: 600;
  font-size: var(--font-size-md);
}

.pricing-override__notes {
  color: var(--secondary-text-color);
  font-size: var(--font-size-xs);
  margin: 0;
  font-style: italic;
}

.button--danger {
  background-color: var(--danger-color);
  color: white;
}

.button--danger:hover {
  background-color: var(--danger-hover-color);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .ticket-type-detail {
    padding: var(--spacing-md);
  }

  .ticket-type-detail__title-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .ticket-type-detail__status-cards {
    grid-template-columns: 1fr;
  }

  .pricing-override__details {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
