<template>
  <div class="performance-edit">
    <div
      v-if="pending"
      class="loading-state"
    >
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-loader-2"
          class="animate-spin"
        />
        <span>Loading performance...</span>
      </div>
    </div>

    <div
      v-else-if="error"
      class="error-state"
    >
      <UAlert
        color="error"
        variant="soft"
        title="Failed to load performance"
        description="The performance could not be found or there was an error loading it."
      />
      <UButton
        color="neutral"
        variant="outline"
        @click="navigateTo('/admin/performances')"
      >
        Back to Performances
      </UButton>
    </div>

    <div
      v-else-if="performance"
      class="performance-edit__content"
    >
      <header class="performance-edit__header">
        <div class="performance-edit__title-section">
          <div>
            <h1 class="performance-edit__title">
              Edit Performance
            </h1>
            <p
              v-if="performance.show"
              class="performance-edit__show"
            >
              for {{ performance.show.title }}
            </p>
          </div>
          <div class="performance-edit__actions">
            <UButton
              color="neutral"
              variant="ghost"
              @click="navigateTo(`/admin/performances/${performanceId}`)"
            >
              Cancel
            </UButton>
          </div>
        </div>
      </header>

      <UCard>
        <UForm
          :state="formData"
          :schema="performanceFormSchema"
          @submit="handleSubmit"
        >
          <div class="form-grid">
            <div class="form-section">
              <h2 class="section-title">
                Performance Details
              </h2>

              <UFormGroup
                label="Performance Title"
                name="title"
                required
              >
                <UInput
                  v-model="formData.title"
                  placeholder="Enter performance title"
                />
              </UFormGroup>

              <UFormGroup
                label="Venue"
                name="venueId"
                required
              >
                <USelect
                  v-model="formData.venueId"
                  :items="venueOptions"
                  placeholder="Select venue"
                  :loading="venuesLoading"
                />
              </UFormGroup>

              <div class="grid grid-cols-2 gap-4">
                <UFormGroup
                  label="Start Date & Time"
                  name="startDateTime"
                  required
                >
                  <UInput
                    v-model="formData.startDateTime"
                    type="datetime-local"
                  />
                </UFormGroup>

                <UFormGroup
                  label="End Date & Time"
                  name="endDateTime"
                  required
                >
                  <UInput
                    v-model="formData.endDateTime"
                    type="datetime-local"
                  />
                </UFormGroup>
              </div>

              <UFormGroup
                label="Performance Type"
                name="type"
                required
              >
                <USelect
                  v-model="formData.type"
                  :items="performanceTypeOptions"
                  placeholder="Select type"
                />
              </UFormGroup>

              <UFormGroup
                label="Details"
                name="details"
              >
                <UTextarea
                  v-model="formData.details"
                  placeholder="Enter performance details"
                  :rows="3"
                />
              </UFormGroup>
            </div>

            <div class="form-section">
              <h2 class="section-title">
                Booking Settings
              </h2>

              <UFormGroup
                label="Booking Status"
                name="status"
                required
              >
                <USelect
                  v-model="formData.status"
                  :items="performanceStatusOptions"
                  placeholder="Select status"
                />
              </UFormGroup>

              <UFormGroup
                label="Max Capacity"
                name="maxCapacity"
                required
                description="Use -1 for unlimited capacity"
              >
                <UInput
                  v-model.number="formData.maxCapacity"
                  type="number"
                  placeholder="e.g., 100"
                />
              </UFormGroup>

              <UFormGroup
                label="Reservations Open"
                name="reservationsOpen"
              >
                <UToggle
                  v-model="formData.reservationsOpen"
                />
              </UFormGroup>

              <UFormGroup
                label="Reservation Instructions"
                name="reservationInstructions"
              >
                <UTextarea
                  v-model="formData.reservationInstructions"
                  placeholder="Enter reservation instructions"
                  :rows="3"
                />
              </UFormGroup>

              <UFormGroup
                label="External Booking Link"
                name="externalBookingLink"
              >
                <UInput
                  v-model="formData.externalBookingLink"
                  type="url"
                  placeholder="https://example.com/book"
                />
              </UFormGroup>
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
              @click="navigateTo(`/admin/performances/${performanceId}`)"
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
  title: 'Edit Performance',
})

const route = useRoute()
const performanceId = route.params.id as string

// Fetch performance data
const { data: response, pending, error } = await useFetch(`/api/v1/admin/performances/${performanceId}`)
const performance = computed(() => response.value?.data)

// Fetch venues
const { data: venuesResponse, pending: venuesLoading } = await useFetch('/api/v1/admin/venues', {
  query: { isActive: 'true', limit: 100 },
})

const venues = computed(() => venuesResponse.value?.data || [])
const venueOptions = computed(() =>
  venues.value.map(v => ({
    value: v.id,
    label: `${v.name}${v.capacity ? ` (${v.capacity})` : ''}`,
  })),
)

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
  { value: 'PAST', label: 'Past' },
]

// Form schema
const performanceFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  venueId: z.string().min(1, 'Venue is required'),
  startDateTime: z.string().min(1, 'Start date and time is required'),
  endDateTime: z.string().min(1, 'End date and time is required'),
  type: z.enum([
    'PERFORMANCE',
    'RELAXED_PERFORMANCE',
    'SIGNED_PERFORMANCE',
    'AUDIO_DESCRIBED_PERFORMANCE',
    'CAPTIONED_PERFORMANCE',
    'DRESS_REHEARSAL',
    'TECHNICAL_RUN',
    'PREVIEW',
    'EVENT',
    'WORKSHOP',
  ]),
  details: z.string().max(2000).optional(),
  status: z.enum(['SCHEDULED', 'ON_SALE', 'RESTRICTED', 'CLOSED', 'SOLD_OUT', 'CANCELLED', 'PAST']),
  maxCapacity: z.number().int().min(-1),
  reservationsOpen: z.boolean(),
  reservationInstructions: z.string().max(1000).optional(),
  externalBookingLink: z.string().url().optional().or(z.literal('')),
}).refine((data) => {
  const start = new Date(data.startDateTime)
  const end = new Date(data.endDateTime)
  return start < end
}, {
  message: 'End date time must be after start date time',
  path: ['endDateTime'],
})

// Initialize form data from performance
const formData = reactive({
  title: performance.value?.title || '',
  venueId: performance.value?.venue?.id || '',
  startDateTime: performance.value?.startDateTime ? new Date(performance.value.startDateTime).toISOString().slice(0, 16) : '',
  endDateTime: performance.value?.endDateTime ? new Date(performance.value.endDateTime).toISOString().slice(0, 16) : '',
  type: (performance.value?.type || 'PERFORMANCE') as 'PERFORMANCE' | 'RELAXED_PERFORMANCE' | 'SIGNED_PERFORMANCE' | 'AUDIO_DESCRIBED_PERFORMANCE' | 'CAPTIONED_PERFORMANCE' | 'DRESS_REHEARSAL' | 'TECHNICAL_RUN' | 'PREVIEW' | 'EVENT' | 'WORKSHOP',
  details: performance.value?.details || '',
  status: (performance.value?.status || 'SCHEDULED') as 'SCHEDULED' | 'ON_SALE' | 'RESTRICTED' | 'CLOSED' | 'SOLD_OUT' | 'CANCELLED' | 'PAST',
  maxCapacity: performance.value?.maxCapacity || 100,
  reservationsOpen: performance.value?.reservationsOpen ?? true,
  reservationInstructions: performance.value?.reservationInstructions || '',
  externalBookingLink: performance.value?.externalBookingLink || '',
})

// Watch for performance data changes (when loading completes)
watch(performance, (newPerformance) => {
  if (newPerformance) {
    formData.title = newPerformance.title
    formData.venueId = newPerformance.venue?.id || ''
    formData.startDateTime = new Date(newPerformance.startDateTime).toISOString().slice(0, 16)
    formData.endDateTime = new Date(newPerformance.endDateTime).toISOString().slice(0, 16)
    formData.type = newPerformance.type as typeof formData.type
    formData.details = newPerformance.details || ''
    formData.status = newPerformance.status as typeof formData.status
    formData.maxCapacity = newPerformance.maxCapacity
    formData.reservationsOpen = newPerformance.reservationsOpen
    formData.reservationInstructions = newPerformance.reservationInstructions || ''
    formData.externalBookingLink = newPerformance.externalBookingLink || ''
  }
})

const isSubmitting = ref(false)

// Handle form submission
async function handleSubmit() {
  try {
    isSubmitting.value = true

    const updateData = {
      title: formData.title,
      startDateTime: new Date(formData.startDateTime).toISOString(),
      endDateTime: new Date(formData.endDateTime).toISOString(),
      type: formData.type,
      details: formData.details || undefined,
      status: formData.status,
      maxCapacity: Number(formData.maxCapacity),
      reservationsOpen: formData.reservationsOpen,
      reservationInstructions: formData.reservationInstructions || undefined,
      externalBookingLink: formData.externalBookingLink || undefined,
      venueId: formData.venueId || undefined,
    }

    await $fetch(`/api/v1/admin/performances/${performanceId}`, {
      method: 'PATCH',
      body: updateData,
    })

    // Navigate back to the performance detail page
    await navigateTo(`/admin/performances/${performanceId}`)
  }
  catch (error: unknown) {
    console.error('Failed to update performance:', error)

    const errorMessage = error && typeof error === 'object' && 'data' in error && error.data && typeof error.data === 'object' && 'message' in error.data
      ? String(error.data.message)
      : error instanceof Error ? error.message : 'Unknown error'

    alert(`Failed to update performance: ${errorMessage}`)
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.performance-edit {
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

.performance-edit__header {
  margin-bottom: 32px;
}

.performance-edit__title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.performance-edit__title {
  font-size: 28px;
  font-weight: 600;
  margin: 0;
}

.performance-edit__show {
  font-size: 16px;
  color: var(--color-gray-600);
  margin: 4px 0 0 0;
}

.performance-edit__actions {
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
