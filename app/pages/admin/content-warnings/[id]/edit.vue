<template>
  <div class="content-warning-edit">
    <header class="content-warning-edit__header">
      <div class="content-warning-edit__title-section">
        <h1 class="content-warning-edit__title">
          Edit Content Warning
        </h1>
        <div class="content-warning-edit__actions">
          <UIButton
            variant="secondary"
            @click="navigateTo('/admin/content-warnings')"
          >
            Back to Content Warnings
          </UIButton>
          <UIButton
            variant="secondary"
            @click="navigateTo(`/admin/content-warnings/${contentWarningId}`)"
          >
            View Details
          </UIButton>
        </div>
      </div>
    </header>

    <div
      v-if="pending"
      class="content-warning-edit__loading"
    >
      <LoadingSpinner />
    </div>

    <div
      v-else-if="error"
      class="content-warning-edit__error"
    >
      <AppAlert type="error">
        {{ error.statusMessage || 'Failed to load content warning details' }}
      </AppAlert>
    </div>

    <div
      v-else-if="contentWarning"
      class="content-warning-edit__content"
    >
      <Form
        :error="form.formError.value"
        @submit="form.handleSubmit"
      >
        <div class="form-grid">
          <!-- Basic Information -->
          <div class="form-section">
            <h2 class="section-title">
              Content Warning Information
            </h2>

            <FormInput
              id="name"
              v-model="nameField"
              label="Name"
              placeholder="Enter content warning name (e.g., Strong Language, Violence)"
              required
            />

            <FormTextarea
              id="description"
              v-model="descriptionField"
              label="Description"
              placeholder="Enter a detailed description of what this content warning covers"
              :rows="4"
            />

            <FormCheckbox
              id="isActive"
              v-model="isActiveField"
              label="Active"
              description="Whether this content warning is currently active and available for use"
            />
          </div>

          <!-- Usage Information (Read-only) -->
          <div class="form-section">
            <h2 class="section-title">
              Usage Information
            </h2>

            <div class="usage-info">
              <div class="usage-item">
                <label class="usage-label">Shows Using:</label>
                <span class="usage-value">
                  {{ contentWarningData?.shows?.length || 0 }} show{{ (contentWarningData?.shows?.length || 0) === 1 ? '' : 's' }}
                </span>
              </div>
              <div
                v-if="contentWarningData?.shows && contentWarningData.shows.length > 0"
                class="usage-item"
              >
                <label class="usage-label">Note:</label>
                <span class="usage-value usage-warning">
                  This content warning is currently in use. Deactivating it may affect show listings.
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <FormButton
            type="submit"
            :disabled="form.isSubmitting.value || !form.isValid.value"
          >
            {{ form.isSubmitting.value ? 'Updating Content Warning...' : 'Update Content Warning' }}
          </FormButton>

          <UIButton
            type="button"
            variant="ghost"
            @click="navigateTo(`/admin/content-warnings/${contentWarningId}`)"
          >
            Cancel
          </UIButton>
        </div>
      </Form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForm } from '#imports'

// Require admin access
definePageMeta({
  middleware: 'admin',
  layout: 'admin',
  title: 'Edit Content Warning',
})

// Get route parameters
const route = useRoute()
const contentWarningId = route.params.id as string

// Fetch content warning details
const { data: contentWarning, pending, error } = await useFetch(`/api/v1/admin/content-warnings/${contentWarningId}`)

// Computed for easier access to nested data
const contentWarningData = computed(() => contentWarning.value?.data?.contentWarning)

// Form submission handler
const handleFormSubmit = async (_values: Record<string, unknown>, changedValues?: Partial<Record<string, unknown>>) => {
  const changes = changedValues || {}

  console.log('Submitting content warning update (only changed fields):', changes)
  console.log('Changes detected:', Object.keys(changes).length, 'fields changed')

  // Only make API call if there are actual changes
  if (Object.keys(changes).length === 0) {
    await navigateTo(`/admin/content-warnings/${contentWarningId}`)
    return
  }

  try {
    await $fetch(`/api/v1/admin/content-warnings/${contentWarningId}`, {
      method: 'PATCH',
      body: changes,
    })

    // Navigate back to detail page
    await navigateTo(`/admin/content-warnings/${contentWarningId}`)
  }
  catch (error: unknown) {
    // Handle API errors
    const apiError = error as { statusCode?: number, data?: { message?: string } }
    if (apiError.statusCode === 409) {
      form.setError('name', 'A content warning with this name already exists')
    }
    else if (apiError.statusCode === 404) {
      form.setFormError('Content warning not found')
    }
    else {
      form.setFormError(apiError.data?.message || 'Failed to update content warning')
    }
  }
}

// Initialize form with current values
const form = useForm({
  initialValues: {
    name: contentWarningData.value?.name || '',
    description: contentWarningData.value?.description || '',
    isActive: contentWarningData.value?.isActive ?? true,
  },
  onSubmit: handleFormSubmit,
  schema: contentWarningUpdateSchema,
})

// Reactive field bindings
const nameField = form.reactiveField('name')
const descriptionField = form.reactiveField('description')
const isActiveField = form.reactiveField<boolean>('isActive', true)

// Set page title
if (contentWarningData.value) {
  useHead({
    title: `Edit ${contentWarningData.value.name} - Content Warning`,
  })
}
</script>

<style scoped>
.content-warning-edit {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}

.content-warning-edit__header {
  margin-bottom: 32px;
}

.content-warning-edit__title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.content-warning-edit__title {
  font-size: 28px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0;
}

.content-warning-edit__actions {
  display: flex;
  gap: 12px;
}

.content-warning-edit__loading,
.content-warning-edit__error {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.content-warning-edit__content {
  background: var(--secondary-bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 32px;
}

.form-grid {
  margin-bottom: 32px;
}

.form-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0 0 4px 0;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 8px;
}

.usage-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.usage-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.usage-label {
  font-weight: 500;
  color: var(--primary-text-color);
  min-width: 120px;
}

.usage-value {
  color: var(--secondary-text-color);
}

.usage-warning {
  color: var(--warning-color, #856404);
  font-style: italic;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .content-warning-edit {
    padding: 16px;
  }

  .content-warning-edit__title-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .content-warning-edit__actions {
    width: 100%;
    flex-direction: column;
  }

  .content-warning-edit__content {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .usage-item {
    flex-direction: column;
    gap: 4px;
  }

  .usage-label {
    min-width: auto;
  }
}

@media (max-width: 480px) {
  .content-warning-edit__title {
    font-size: 20px;
  }

  .section-title {
    font-size: 16px;
  }

  .content-warning-edit__actions {
    flex-direction: column;
  }
}
</style>
