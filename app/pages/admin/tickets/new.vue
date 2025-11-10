<template>
  <div class="ticket-type-create">
    <header class="ticket-type-create__header">
      <div class="ticket-type-create__title-section">
        <h1 class="ticket-type-create__title">
          Create New Ticket Type
        </h1>
        <UIButton
          variant="secondary"
          @click="navigateTo('/admin/tickets')"
        >
          Back to Ticket Types
        </UIButton>
      </div>
    </header>

    <div class="ticket-type-create__content">
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
          >
            {{ form.isSubmitting.value ? 'Creating Ticket Type...' : 'Create Ticket Type' }}
          </FormButton>

          <UIButton
            type="button"
            variant="ghost"
            @click="navigateTo('/admin/tickets')"
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
  title: 'Create Ticket Type',
})

interface FormData {
  name: string
  description?: string
  defaultPrice: string
  sortOrder?: string
  isActive: boolean
}

// Form submission handler
const handleFormSubmit = async (values: FormData) => {
  const submitData = {
    name: values.name.trim(),
    description: values.description?.trim() || null,
    defaultPrice: parseFloat(values.defaultPrice),
    sortOrder: values.sortOrder ? parseInt(values.sortOrder) : null,
    isActive: values.isActive ?? true,
  }

  const response = await $fetch<{ id: string, name: string }>('/api/v1/admin/tickets', {
    method: 'POST',
    body: submitData,
  })

  // Navigate to the new ticket type's detail page
  if (response?.id) {
    await navigateTo(`/admin/tickets/${response.id}`)
  }
  else {
    await navigateTo('/admin/tickets')
  }
}

// Initialize useForm
const form = useForm({
  schema: ticketTypeFormSchema,
  initialValues: {
    name: '',
    description: '',
    defaultPrice: '',
    sortOrder: '',
    isActive: true,
  } as FormData,
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
.ticket-type-create {
  max-width: 800px;
  margin: 0 auto;
  padding: var(--spacing-lg);
}

.ticket-type-create__header {
  margin-bottom: var(--spacing-xl);
}

.ticket-type-create__title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-md);
}

.ticket-type-create__title {
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0;
}

.ticket-type-create__content {
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
  .ticket-type-create {
    padding: var(--spacing-md);
  }

  .ticket-type-create__title-section {
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
