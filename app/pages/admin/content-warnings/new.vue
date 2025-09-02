<template>
  <div class="content-warning-create">
    <header class="content-warning-create__header">
      <div class="content-warning-create__title-section">
        <h1 class="content-warning-create__title">
          Create New Content Warning
        </h1>
        <UIButton
          variant="secondary"
          @click="navigateTo('/admin/content-warnings')"
        >
          Back to Content Warnings
        </UIButton>
      </div>
    </header>

    <div class="content-warning-create__content">
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
        </div>

        <div class="form-actions">
          <FormButton
            type="submit"
            :disabled="form.isSubmitting.value || !form.isValid.value"
          >
            {{ form.isSubmitting.value ? 'Creating Content Warning...' : 'Create Content Warning' }}
          </FormButton>

          <UIButton
            type="button"
            variant="ghost"
            @click="navigateTo('/admin/content-warnings')"
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
  title: 'Create Content Warning',
})

// Form submission handler
const handleFormSubmit = async (data: Record<string, unknown>) => {
  try {
    const formData = data as { name: string, description?: string, isActive: boolean }
    const response = await $fetch('/api/admin/content-warnings', {
      method: 'POST',
      body: {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        isActive: formData.isActive,
      },
    })

    // Show success message
    await navigateTo(`/admin/content-warnings/${response.data?.contentWarning?.id}`)
  }
  catch (error: unknown) {
    // Handle API errors
    const apiError = error as { statusCode?: number, data?: { message?: string } }
    if (apiError.statusCode === 409) {
      form.setError('name', 'A content warning with this name already exists')
    }
    else {
      form.setFormError(apiError.data?.message || 'Failed to create content warning')
    }
  }
}

// Form setup
const form = useForm({
  initialValues: {
    name: '',
    description: '',
    isActive: true,
  },
  onSubmit: handleFormSubmit,
  schema: contentWarningFormSchema,
})

// Reactive field bindings
const nameField = form.reactiveField('name')
const descriptionField = form.reactiveField('description')
const isActiveField = form.reactiveField<boolean>('isActive', true)
</script>

<style scoped>
.content-warning-create {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.content-warning-create__header {
  margin-bottom: 32px;
}

.content-warning-create__title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.content-warning-create__title {
  font-size: 28px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0;
}

.content-warning-create__content {
  background: var(--secondary-bg-color);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 32px;
}

.form-grid {
  margin-bottom: 32px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0 0 4px 0;
  border-bottom: 2px solid var(--border-color);
  padding-bottom: 8px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

@media (max-width: 768px) {
  .content-warning-create {
    padding: 16px;
  }

  .content-warning-create__title-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .content-warning-create__content {
    padding: 20px;
  }

  .form-actions {
    flex-direction: column-reverse;
  }
}

@media (max-width: 480px) {
  .content-warning-create__title {
    font-size: 20px;
  }

  .section-title {
    font-size: 16px;
  }
}
</style>
