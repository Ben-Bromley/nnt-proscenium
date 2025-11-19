<template>
  <div class="show-edit">
    <div
      v-if="pending"
      class="loading-state"
    >
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-loader-2"
          class="animate-spin"
        />
        <span>Loading show...</span>
      </div>
    </div>

    <div
      v-else-if="error"
      class="error-state"
    >
      <UAlert
        color="error"
        variant="soft"
        title="Failed to load show"
        description="The show could not be found or there was an error loading it."
      />
      <UButton
        color="neutral"
        variant="outline"
        @click="navigateTo('/admin/shows')"
      >
        Back to Shows
      </UButton>
    </div>

    <div
      v-else-if="show"
      class="show-edit__content"
    >
      <header class="show-edit__header">
        <div class="show-edit__title-section">
          <h1 class="show-edit__title">
            Edit Show
          </h1>
          <div class="show-edit__actions">
            <UButton
              color="neutral"
              variant="ghost"
              @click="navigateTo(`/admin/shows/${showId}`)"
            >
              Cancel
            </UButton>
          </div>
        </div>
      </header>

      <UCard>
        <UForm
          :state="formData"
          :schema="showFormSchema"
          @submit="handleSubmit"
        >
          <div class="form-grid">
            <!-- Basic Information -->
            <div class="form-section">
              <h2 class="section-title">
                Basic Information
              </h2>

              <UFormGroup
                label="Show Title"
                name="title"
                required
              >
                <UInput
                  v-model="formData.title"
                  placeholder="Enter show title"
                />
              </UFormGroup>

              <UFormGroup
                label="URL Slug"
                name="slug"
                required
                description="URL-friendly identifier (e.g., 'the-tempest-2025')"
              >
                <UInput
                  v-model="formData.slug"
                  placeholder="url-slug"
                />
              </UFormGroup>

              <UFormGroup
                label="Description"
                name="description"
                required
              >
                <UTextarea
                  v-model="formData.description"
                  placeholder="Enter show description"
                  :rows="5"
                />
              </UFormGroup>

              <UFormGroup
                label="Show Type"
                name="showType"
                required
              >
                <USelect
                  v-model="formData.showType"
                  :items="showTypeOptions"
                  placeholder="Select show type"
                />
              </UFormGroup>

              <UFormGroup
                label="Status"
                name="status"
                required
              >
                <USelect
                  v-model="formData.status"
                  :items="statusOptions"
                  placeholder="Select status"
                />
              </UFormGroup>

              <UFormGroup
                label="Age Rating"
                name="ageRating"
                description="e.g., '12A', '18+', 'U'"
              >
                <UInput
                  v-model="formData.ageRating"
                  placeholder="Enter age rating (optional)"
                />
              </UFormGroup>

              <UFormGroup
                label="Poster Image URL"
                name="posterImageUrl"
              >
                <UInput
                  v-model="formData.posterImageUrl"
                  type="url"
                  placeholder="https://example.com/poster.jpg"
                />
              </UFormGroup>

              <UFormGroup
                label="Programme URL"
                name="programmeUrl"
                description="Link to PDF or webpage with the show programme"
              >
                <UInput
                  v-model="formData.programmeUrl"
                  type="url"
                  placeholder="https://example.com/programme.pdf"
                />
              </UFormGroup>
            </div>

            <!-- Performances Section -->
            <div class="form-section">
              <div class="section-header">
                <h2 class="section-title">
                  Performances
                </h2>
                <p class="section-note">
                  Manage performances on the <NuxtLink
                    :to="`/admin/shows/${showId}`"
                    class="inline-link"
                  >
                    show detail page
                  </NuxtLink>
                </p>
              </div>

              <div
                v-if="show.performances && show.performances.length > 0"
                class="performances-summary"
              >
                <div
                  v-for="performance in show.performances"
                  :key="performance.id"
                  class="performance-summary-item"
                >
                  <div class="performance-summary-info">
                    <div class="performance-summary-title">
                      {{ performance.title }}
                    </div>
                    <div class="performance-summary-meta">
                      {{ formatDateTime(performance.startDateTime) }}
                      <span v-if="performance.venue">• {{ performance.venue.name }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-else
                class="no-performances"
              >
                <UAlert
                  color="info"
                  variant="soft"
                  icon="i-lucide-info"
                  title="No performances scheduled"
                  description="Add performances after saving this show"
                />
              </div>
            </div>
          </div>

          <div class="form-actions">
            <UButton
              type="submit"
              color="primary"
              size="lg"
              :loading="isSubmitting"
              :disabled="isSubmitting"
            >
              {{ isSubmitting ? 'Saving Changes...' : 'Save Changes' }}
            </UButton>

            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              size="lg"
              @click="navigateTo(`/admin/shows/${showId}`)"
            >
              Cancel
            </UButton>
          </div>
        </UForm>
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'

definePageMeta({
  middleware: 'admin',
  layout: 'admin',
  title: 'Edit Show',
})

const route = useRoute()
const showId = route.params.id as string

// Fetch show data
const { data: response, pending, error } = await useFetch(`/api/v1/admin/shows/${showId}`)

const show = computed(() => response.value?.data)

// Show type options
const showTypeOptions = [
  { value: 'IN_HOUSE', label: 'In House' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'FESTIVAL', label: 'Festival' },
  { value: 'EXTERNAL_HIRE', label: 'External Hire' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'OTHER', label: 'Other' },
]

// Status options
const statusOptions = [
  { value: 'DRAFT', label: 'Draft' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

// Form schema
const showFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().min(1, 'Description is required').max(2000),
  showType: z.enum(['IN_HOUSE', 'STUDIO', 'FESTIVAL', 'EXTERNAL_HIRE', 'WORKSHOP', 'OTHER']),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CANCELLED']),
  ageRating: z.string().max(10).optional(),
  posterImageUrl: z.string().url().optional().or(z.literal('')),
  programmeUrl: z.string().url().optional().or(z.literal('')),
})

// Initialize form data from show
const formData = reactive({
  title: show.value?.title || '',
  slug: show.value?.slug || '',
  description: show.value?.description || '',
  showType: (show.value?.showType || 'IN_HOUSE') as 'IN_HOUSE' | 'STUDIO' | 'FESTIVAL' | 'EXTERNAL_HIRE' | 'WORKSHOP' | 'OTHER',
  status: (show.value?.status || 'DRAFT') as 'DRAFT' | 'PUBLISHED' | 'CANCELLED',
  ageRating: show.value?.ageRating || '',
  posterImageUrl: show.value?.posterImageUrl || '',
  programmeUrl: show.value?.programmeUrl || '',
})

// Watch for show data changes (when loading completes)
watch(show, (newShow) => {
  if (newShow) {
    formData.title = newShow.title
    formData.slug = newShow.slug
    formData.description = newShow.description
    formData.showType = newShow.showType as typeof formData.showType
    formData.status = newShow.status as typeof formData.status
    formData.ageRating = newShow.ageRating || ''
    formData.posterImageUrl = newShow.posterImageUrl || ''
    formData.programmeUrl = newShow.programmeUrl || ''
  }
})

const isSubmitting = ref(false)

// Formatters
const { formatDateTime } = useFormatters()

function formatPerformanceStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function getPerformanceStatusColor(status: string): 'neutral' | 'success' | 'warning' | 'error' {
  const colorMap: Record<string, 'neutral' | 'success' | 'warning' | 'error'> = {
    SCHEDULED: 'neutral',
    ON_SALE: 'success',
    RESTRICTED: 'warning',
    CLOSED: 'neutral',
    SOLD_OUT: 'error',
    CANCELLED: 'error',
    PAST: 'neutral',
  }
  return colorMap[status] || 'neutral'
}

// Handle form submission
async function handleSubmit() {
  try {
    isSubmitting.value = true

    // Prepare update data
    const updateData = {
      title: formData.title,
      slug: formData.slug,
      description: formData.description,
      showType: formData.showType,
      status: formData.status,
      ageRating: formData.ageRating || undefined,
      posterImageUrl: formData.posterImageUrl || undefined,
      programmeUrl: formData.programmeUrl || undefined,
    }

    await $fetch(`/api/v1/admin/shows/${showId}`, {
      method: 'PATCH',
      body: updateData,
    })

    // Navigate back to the show detail page
    await navigateTo(`/admin/shows/${showId}`)
  }
  catch (error: unknown) {
    console.error('Failed to update show:', error)

    const errorMessage = error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
      ? String(error.data.message)
      : error instanceof Error ? error.message : 'Unknown error'

    alert(`Failed to update show: ${errorMessage}`)
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.show-edit {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px 24px;
}

.show-edit__header {
  margin-bottom: 32px;
}

.show-edit__title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.show-edit__title {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

.show-edit__actions {
  display: flex;
  gap: 8px;
}

.form-grid {
  display: grid;
  gap: 32px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--color-gray-200);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.section-header .section-title {
  margin: 0;
  border: none;
  padding: 0;
}

.section-note {
  font-size: 14px;
  color: var(--color-gray-600);
  margin: 0;
}

.inline-link {
  color: var(--color-primary-600);
  text-decoration: none;
}

.inline-link:hover {
  text-decoration: underline;
}

.performances-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.performance-summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--color-gray-50);
  border: 1px solid var(--color-gray-200);
  border-radius: 6px;
}

.performance-summary-info {
  flex: 1;
}

.performance-summary-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.performance-summary-meta {
  font-size: 13px;
  color: var(--color-gray-600);
}

.no-performances {
  margin: 16px 0;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid var(--color-gray-200);
}

@media (min-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr 1fr;
  }
}
</style>
