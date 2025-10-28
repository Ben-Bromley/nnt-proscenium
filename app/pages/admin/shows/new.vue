<template>
  <div class="show-create">
    <header class="show-create__header">
      <div class="show-create__title-section">
        <h1 class="show-create__title">
          Create New Show
        </h1>
        <UButton
          color="neutral"
          variant="ghost"
          @click="navigateTo('/admin/shows')"
        >
          Back to Shows
        </UButton>
      </div>
    </header>

    <div class="show-create__content">
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
                  @blur="generateSlug"
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
                  placeholder="will-be-auto-generated"
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
                <UButton
                  color="primary"
                  variant="soft"
                  size="sm"
                  icon="i-lucide-plus"
                  @click="addPerformance"
                >
                  Add Performance
                </UButton>
              </div>

              <div
                v-if="venuesLoading"
                class="venues-loading"
              >
                <div class="flex items-center gap-2">
                  <UIcon
                    name="i-lucide-loader-2"
                    class="animate-spin"
                  />
                  <span>Loading venues...</span>
                </div>
              </div>

              <div
                v-else-if="venuesError"
                class="venues-error"
              >
                <UAlert
                  color="error"
                  variant="soft"
                  title="Failed to load venues"
                  description="Please refresh the page to try again"
                />
              </div>

              <div
                v-else-if="performances.length === 0"
                class="no-performances"
              >
                <UAlert
                  color="info"
                  variant="soft"
                  icon="i-lucide-info"
                  title="No performances added yet"
                  description="Click 'Add Performance' to schedule performances for this show"
                />
              </div>

              <div
                v-else
                class="performances-list"
              >
                <UCard
                  v-for="(performance, index) in performances"
                  :key="index"
                  class="performance-card"
                >
                  <div class="performance-header">
                    <h3 class="performance-number">
                      Performance {{ index + 1 }}
                    </h3>
                    <UButton
                      color="error"
                      variant="ghost"
                      size="sm"
                      icon="i-lucide-trash-2"
                      @click="removePerformance(index)"
                    >
                      Remove
                    </UButton>
                  </div>

                  <div class="performance-fields">
                    <UFormGroup
                      :label="`Performance ${index + 1} Title`"
                      :name="`performances.${index}.title`"
                      required
                    >
                      <UInput
                        v-model="performance.title"
                        placeholder="e.g., 'Opening Night', 'Matinee'"
                      />
                    </UFormGroup>

                    <UFormGroup
                      label="Venue"
                      :name="`performances.${index}.venueId`"
                      required
                    >
                      <USelect
                        v-model="performance.venueId"
                        :items="venueOptions"
                        placeholder="Select venue"
                      />
                    </UFormGroup>

                    <div class="grid grid-cols-2 gap-4">
                      <UFormGroup
                        label="Start Date & Time"
                        :name="`performances.${index}.startDateTime`"
                        required
                      >
                        <UInput
                          v-model="performance.startDateTime"
                          type="datetime-local"
                        />
                      </UFormGroup>

                      <UFormGroup
                        label="End Date & Time"
                        :name="`performances.${index}.endDateTime`"
                        required
                      >
                        <UInput
                          v-model="performance.endDateTime"
                          type="datetime-local"
                        />
                      </UFormGroup>
                    </div>

                    <UFormGroup
                      label="Performance Type"
                      :name="`performances.${index}.type`"
                      required
                    >
                      <USelect
                        v-model="performance.type"
                        :items="performanceTypeOptions"
                        placeholder="Select type"
                      />
                    </UFormGroup>

                    <UFormGroup
                      label="Max Capacity"
                      :name="`performances.${index}.maxCapacity`"
                      required
                      description="Use -1 for unlimited capacity"
                    >
                      <UInput
                        v-model.number="performance.maxCapacity"
                        type="number"
                        placeholder="e.g., 100"
                      />
                    </UFormGroup>

                    <UFormGroup
                      label="Details"
                      :name="`performances.${index}.details`"
                    >
                      <UTextarea
                        v-model="performance.details"
                        placeholder="Additional performance details"
                        :rows="2"
                      />
                    </UFormGroup>

                    <UFormGroup
                      label="Booking Status"
                      :name="`performances.${index}.status`"
                    >
                      <USelect
                        v-model="performance.status"
                        :items="performanceStatusOptions"
                        placeholder="Select status"
                      />
                    </UFormGroup>

                    <div class="grid grid-cols-2 gap-4">
                      <UFormGroup
                        label="Reservations Open"
                        :name="`performances.${index}.reservationsOpen`"
                      >
                        <UToggle v-model="performance.reservationsOpen" />
                      </UFormGroup>
                    </div>
                  </div>
                </UCard>
              </div>

              <div
                v-if="performances.length > 0"
                class="quick-add-section"
              >
                <UButton
                  color="primary"
                  variant="outline"
                  size="sm"
                  icon="i-lucide-copy"
                  @click="duplicateLastPerformance"
                >
                  Duplicate Last Performance
                </UButton>
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
              {{ isSubmitting ? 'Creating Show...' : 'Create Show' }}
            </UButton>

            <UButton
              type="button"
              color="neutral"
              variant="ghost"
              size="lg"
              @click="navigateTo('/admin/shows')"
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
  title: 'Create Show',
})

// Fetch venues
const { data: venuesResponse, pending: venuesLoading, error: venuesError } = await useFetch('/api/admin/venues', {
  query: { isActive: 'true', limit: 100 },
})

const venues = computed(() => venuesResponse.value?.data || [])
const venueOptions = computed(() =>
  venues.value.map(v => ({
    value: v.id,
    label: `${v.name}${v.capacity ? ` (${v.capacity})` : ''}`,
  })),
)

// Show type options
const showTypeOptions = [
  { value: 'IN_HOUSE', label: 'In House' },
  { value: 'STUDIO', label: 'Studio' },
  { value: 'FESTIVAL', label: 'Festival' },
  { value: 'EXTERNAL_HIRE', label: 'External Hire' },
  { value: 'WORKSHOP', label: 'Workshop' },
  { value: 'OTHER', label: 'Other' },
]

// Performance type options
const performanceTypeOptions = [
  { value: 'PERFORMANCE', label: 'Performance' },
  { value: 'RELAXED_PERFORMANCE', label: 'Relaxed Performance' },
  { value: 'SIGNED_PERFORMANCE', label: 'Signed Performance' },
  { value: 'AUDIO_DESCRIBED_PERFORMANCE', label: 'Audio Described' },
  { value: 'CAPTIONED_PERFORMANCE', label: 'Captioned Performance' },
  { value: 'DRESS_REHEARSAL', label: 'Dress Rehearsal' },
  { value: 'TECHNICAL_RUN', label: 'Technical Run' },
  { value: 'PREVIEW', label: 'Preview' },
  { value: 'EVENT', label: 'Event' },
  { value: 'WORKSHOP', label: 'Workshop' },
]

// Performance status options
const performanceStatusOptions = [
  { value: 'SCHEDULED', label: 'Scheduled' },
  { value: 'ON_SALE', label: 'On Sale' },
  { value: 'RESTRICTED', label: 'Restricted' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'SOLD_OUT', label: 'Sold Out' },
  { value: 'CANCELLED', label: 'Cancelled' },
]

// Form schema
const showFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  description: z.string().min(1, 'Description is required').max(2000),
  showType: z.enum(['IN_HOUSE', 'STUDIO', 'FESTIVAL', 'EXTERNAL_HIRE', 'WORKSHOP', 'OTHER']),
  ageRating: z.string().max(10).optional(),
  posterImageUrl: z.string().url().optional().or(z.literal('')),
  programmeUrl: z.string().url().optional().or(z.literal('')),
})

// Form state
const formData = reactive({
  title: '',
  slug: '',
  description: '',
  showType: 'IN_HOUSE' as const,
  ageRating: '',
  posterImageUrl: '',
  programmeUrl: '',
})

interface Performance {
  title: string
  venueId: string
  startDateTime: string
  endDateTime: string
  type: string
  details: string
  status: string
  maxCapacity: number
  reservationsOpen: boolean
}

const performances = ref<Performance[]>([])
const isSubmitting = ref(false)

// Generate slug from title
function generateSlug() {
  if (!formData.title || formData.slug) return

  formData.slug = formData.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Add a new performance
function addPerformance() {
  const now = new Date()
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const twoHoursLater = new Date(nextWeek.getTime() + 2 * 60 * 60 * 1000)

  performances.value.push({
    title: `Performance ${performances.value.length + 1}`,
    venueId: '',
    startDateTime: nextWeek.toISOString().slice(0, 16),
    endDateTime: twoHoursLater.toISOString().slice(0, 16),
    type: 'PERFORMANCE',
    details: '',
    status: 'SCHEDULED',
    maxCapacity: 100,
    reservationsOpen: true,
  })
}

// Remove a performance
function removePerformance(index: number) {
  performances.value.splice(index, 1)
}

// Duplicate last performance
function duplicateLastPerformance() {
  if (performances.value.length === 0) return

  const last = performances.value[performances.value.length - 1]
  if (!last) return

  const lastStart = new Date(last.startDateTime)
  const lastEnd = new Date(last.endDateTime)
  const duration = lastEnd.getTime() - lastStart.getTime()

  // Add 1 day to the last performance
  const newStart = new Date(lastStart.getTime() + 24 * 60 * 60 * 1000)
  const newEnd = new Date(newStart.getTime() + duration)

  performances.value.push({
    title: `Performance ${performances.value.length + 1}`,
    venueId: last.venueId,
    startDateTime: newStart.toISOString().slice(0, 16),
    endDateTime: newEnd.toISOString().slice(0, 16),
    type: last.type,
    details: last.details,
    status: last.status,
    maxCapacity: last.maxCapacity,
    reservationsOpen: last.reservationsOpen,
  })
}

// Handle form submission
async function handleSubmit() {
  try {
    isSubmitting.value = true

    // Prepare show data
    const showData = {
      title: formData.title,
      slug: formData.slug,
      description: formData.description,
      showType: formData.showType,
      ageRating: formData.ageRating || undefined,
      posterImageUrl: formData.posterImageUrl || undefined,
      programmeUrl: formData.programmeUrl || undefined,
    }

    // Create the show first
    const response = await $fetch<{ success: boolean, data: { id: string } }>('/api/admin/shows', {
      method: 'POST',
      body: showData,
    })

    const showId = response.data.id

    // Create performances if any
    if (performances.value.length > 0) {
      await Promise.all(
        performances.value.map(perf =>
          $fetch(`/api/admin/shows/${showId}/performances`, {
            method: 'POST',
            body: {
              title: perf.title,
              startDateTime: new Date(perf.startDateTime).toISOString(),
              endDateTime: new Date(perf.endDateTime).toISOString(),
              type: perf.type,
              details: perf.details || undefined,
              status: perf.status,
              maxCapacity: Number(perf.maxCapacity),
              reservationsOpen: perf.reservationsOpen,
              venueId: perf.venueId || undefined,
            },
          }),
        ),
      )
    }

    // Navigate to the new show's detail page
    await navigateTo(`/admin/shows/${showId}`)
  }
  catch (error: unknown) {
    console.error('Failed to create show:', error)

    const errorMessage = error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
      ? String(error.data.message)
      : error instanceof Error ? error.message : 'Unknown error'

    // Show error notification (if you have a toast/notification system)
    alert(`Failed to create show: ${errorMessage}`)
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.show-create {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.show-create__header {
  margin-bottom: 32px;
}

.show-create__title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.show-create__title {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
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
  margin-bottom: 16px;
}

.section-header .section-title {
  margin: 0;
  border: none;
  padding: 0;
}

.performances-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.performance-card {
  border: 1px solid var(--color-gray-200);
}

.performance-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-gray-100);
}

.performance-number {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.performance-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.quick-add-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed var(--color-gray-200);
}

.no-performances,
.venues-loading,
.venues-error {
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
