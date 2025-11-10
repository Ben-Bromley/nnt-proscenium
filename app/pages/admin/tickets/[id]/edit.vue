<template>
  <div class="ticket-type-edit">
    <header class="ticket-type-edit__header">
      <div class="ticket-type-edit__title-section">
        <h1 class="ticket-type-edit__title">
          Edit Ticket Type
        </h1>
        <div class="ticket-type-edit__actions">
          <UIButton
            variant="secondary"
            @click="navigateTo(`/admin/tickets/${ticketTypeId}`)"
          >
            Cancel
          </UIButton>
        </div>
      </div>
    </header>

    <div
      v-if="pending"
      class="ticket-type-edit__loading"
    >
      <LoadingSpinner />
    </div>

    <div
      v-else-if="fetchError"
      class="ticket-type-edit__error"
    >
      <AppAlert type="error">
        {{ fetchError.statusMessage || 'Failed to load ticket type details' }}
      </AppAlert>
    </div>

    <div
      v-else-if="ticketType"
      class="ticket-type-edit__content"
    >
      <Form
        :error="form.formError.value"
        @submit="form.handleSubmit"
      >
        <div class="form-section">
          <h2 class="section-title">
            Ticket Type Information
          </h2>

          <div class="form-grid">
            <FormInput
              id="name"
              v-model="nameField"
              label="Ticket Type Name"
              placeholder="e.g. Adult, Student, Member"
              required
            />

            <FormInput
              id="defaultPrice"
              v-model="defaultPriceField"
              label="Default Price (£)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              required
            />

            <FormInput
              id="sortOrder"
              v-model="sortOrderField"
              label="Sort Order"
              type="number"
              min="0"
              placeholder="Leave empty for automatic ordering"
            />
          </div>

          <FormTextarea
            id="description"
            v-model="descriptionField"
            label="Description"
            placeholder="Optional description of the ticket type"
            :rows="3"
          />

          <FormCheckbox
            id="isActive"
            v-model="isActiveField"
            label="Active"
            description="Whether this ticket type is available for use"
          />
        </div>

        <div class="form-actions">
          <FormButton
            type="submit"
            :disabled="form.isSubmitting.value || !form.isValid.value"
            :loading="form.isSubmitting.value"
          >
            Save Changes
          </FormButton>
          <UIButton
            type="button"
            variant="secondary"
            @click="navigateTo(`/admin/tickets/${ticketTypeId}`)"
          >
            Cancel
          </UIButton>
        </div>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
// Require admin access
definePageMeta({
  middleware: 'admin',
  layout: 'admin',
  title: 'Edit Ticket Type',
})

const route = useRoute()
const ticketTypeId = route.params.id as string

interface TicketTypeData {
  id: string
  name: string
  description?: string | null
  defaultPrice: number
  sortOrder?: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ApiResponse {
  success: boolean
  data: TicketTypeData
}

interface FormData {
  name: string
  description?: string
  defaultPrice: string
  sortOrder?: string
  isActive: boolean
}

// Fetch ticket type data
const { data: response, pending, error: fetchError } = await useFetch<ApiResponse>(`/api/v1/admin/tickets/${ticketTypeId}`)

// Extract ticket type from response
const ticketType = computed(() => response.value?.data)

// Initialize form with default values
const defaultFormData: FormData = {
  name: ticketType.value?.name || '',
  description: ticketType.value?.description || '',
  defaultPrice: ticketType.value?.defaultPrice?.toString() || '',
  sortOrder: ticketType.value?.sortOrder?.toString() || '',
  isActive: ticketType.value?.isActive ?? true,
}

// Form submission handler
const handleFormSubmit = async (_values: FormData, changedValues?: Partial<FormData>) => {
  const changes = changedValues || {}

  console.log('Submitting ticket type update (only changed fields):', changes)
  console.log('Changes detected:', Object.keys(changes).length, 'fields changed')

  // Only make API call if there are actual changes
  if (Object.keys(changes).length === 0) {
    await navigateTo(`/admin/tickets/${ticketTypeId}`)
    return
  }

  // Transform the data for API
  const updateData: Record<string, unknown> = {}

  Object.entries(changes).forEach(([key, value]) => {
    if (key === 'defaultPrice' && value !== undefined) {
      updateData.defaultPrice = parseFloat(String(value))
    }
    else if (key === 'sortOrder' && value !== undefined) {
      updateData.sortOrder = value ? parseInt(String(value)) : null
    }
    else if (key === 'description' && value !== undefined) {
      updateData.description = value ? String(value).trim() : null
    }
    else if (key === 'name' && value !== undefined) {
      updateData.name = String(value).trim()
    }
    else {
      updateData[key] = value
    }
  })

  await $fetch(`/api/v1/admin/tickets/${ticketTypeId}`, {
    method: 'PATCH',
    body: updateData,
  })

  // Navigate back to ticket type detail page on success
  await navigateTo(`/admin/tickets/${ticketTypeId}`)
}

// Initialize useForm
const form = useForm({
  schema: ticketTypeFormSchema,
  initialValues: defaultFormData,
  onSubmit: handleFormSubmit,
})

// Create reactive form fields
const nameField = form.reactiveField('name')
const descriptionField = form.reactiveField('description')
const defaultPriceField = form.reactiveField('defaultPrice')
const sortOrderField = form.reactiveField('sortOrder')
const isActiveField = form.reactiveField<boolean>('isActive')
</script>

<style scoped>
.ticket-type-edit {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.ticket-type-edit__header {
  margin-bottom: var(--spacing-xl);
}

.ticket-type-edit__title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.ticket-type-edit__title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0;
}

.ticket-type-edit__actions {
  display: flex;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.ticket-type-edit__loading,
.ticket-type-edit__error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.ticket-type-edit__content {
  background-color: var(--secondary-bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: var(--spacing-xl);
}

.form-section {
  margin-bottom: var(--spacing-xl);
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0 0 var(--spacing-lg) 0;
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-lg);
}

.form-actions {
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border-color);
  margin-top: var(--spacing-xl);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .ticket-type-edit {
    padding: var(--spacing-md);
  }

  .ticket-type-edit__title-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column-reverse;
  }
}
</style>
