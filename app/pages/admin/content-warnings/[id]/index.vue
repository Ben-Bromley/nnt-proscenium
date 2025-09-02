<template>
  <div class="content-warning-detail">
    <header class="content-warning-detail__header">
      <div class="content-warning-detail__title-section">
        <h1 class="content-warning-detail__title">
          Content Warning Details
        </h1>
        <div class="content-warning-detail__actions">
          <UIButton
            variant="secondary"
            @click="navigateTo('/admin/content-warnings')"
          >
            Back to Content Warnings
          </UIButton>
          <UIButton
            variant="primary"
            @click="navigateTo(`/admin/content-warnings/${contentWarningId}/edit`)"
          >
            Edit Content Warning
          </UIButton>
          <UIButton
            v-if="contentWarningData?.isActive"
            variant="secondary"
            :class="{ 'button--danger': true }"
            @click="showDeleteModal = true"
          >
            Delete Content Warning
          </UIButton>
        </div>
      </div>
    </header>

    <div
      v-if="pending"
      class="content-warning-detail__loading"
    >
      <LoadingSpinner />
    </div>

    <div
      v-else-if="error"
      class="content-warning-detail__error"
    >
      <AppAlert type="error">
        {{ error.statusMessage || 'Failed to load content warning details' }}
      </AppAlert>
    </div>

    <div
      v-else-if="contentWarningData"
      class="content-warning-detail__content"
    >
      <div class="content-warning-detail__grid">
        <!-- Basic Information -->
        <UIDetailSection title="Basic Information">
          <UIDetailGrid>
            <UIDetailItem
              label="Name"
              :value="contentWarningData.name"
            />
            <UIDetailItem
              label="Description"
              :value="contentWarningData.description || 'No description provided'"
            />
            <UIDetailItem label="Status">
              <UIStatusBadge
                :status="contentWarningData.isActive ? 'active' : 'inactive'"
                :label="contentWarningData.isActive ? 'Active' : 'Inactive'"
              />
            </UIDetailItem>
          </UIDetailGrid>
        </UIDetailSection>

        <!-- Usage Information -->
        <UIDetailSection title="Usage Information">
          <UIDetailGrid>
            <UIDetailItem
              label="Shows Using"
              :value="contentWarningData.shows ? `${contentWarningData.shows.length} show${contentWarningData.shows.length === 1 ? '' : 's'}` : 'No shows using this content warning'"
            />
            <!-- <UIDetailItem
              label="Total Performances"
              :value="usageStats?.totalPerformances ? `${usageStats.totalPerformances} performance${usageStats.totalPerformances === 1 ? '' : 's'}` : 'No performances'"
            />
            <UIDetailItem
              label="Upcoming Performances"
              :value="usageStats?.upcomingPerformances ? `${usageStats.upcomingPerformances} upcoming performance${usageStats.upcomingPerformances === 1 ? '' : 's'}` : 'No upcoming performances'"
            /> -->
          </UIDetailGrid>
        </UIDetailSection>

        <!-- Metadata -->
        <UIDetailSection title="Metadata">
          <UIDetailGrid>
            <UIDetailItem
              label="Created"
              :value="formatDateTime(contentWarningData.createdAt)"
            />
            <UIDetailItem
              label="Last Updated"
              :value="formatDateTime(contentWarningData.updatedAt)"
            />
          </UIDetailGrid>
        </UIDetailSection>

        <!-- Related Shows -->
        <UIDetailSection
          v-if="relatedShows && relatedShows.length > 0"
          title="Related Shows"
        >
          <div class="related-shows">
            <div
              v-for="show in relatedShows"
              :key="show.id"
              class="related-show-item"
            >
              <h4 class="related-show-title">
                <NuxtLink
                  :to="`/admin/shows/${show.id}`"
                  class="related-show-link"
                >
                  {{ show.title }}
                </NuxtLink>
              </h4>
              <!-- <p class="related-show-info">
                <span v-if="show.venue?.name">{{ show.venue.name }}</span>
                <span v-if="show._count?.performances">
                  • {{ show._count.performances }} performance{{ show._count.performances === 1 ? '' : 's' }}
                </span>
                <span v-if="show.upcomingPerformances && show.upcomingPerformances > 0">
                  • {{ show.upcomingPerformances }} upcoming
                </span>
              </p> -->
            </div>
          </div>
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
  title: 'Content Warning Details',
})

// Get route parameters
const route = useRoute()
const contentWarningId = route.params.id as string

// Reactive state
const showDeleteModal = ref(false)
const deleting = ref(false)

// Formatters
const { formatDateTime } = useFormatters()

// Fetch content warning details
const { data, pending, error } = await useFetch(`/api/admin/content-warnings/${contentWarningId}`)

// Computed values for easier access
const contentWarningData = computed(() => data.value?.data?.contentWarning)

// Computed property for related shows
const relatedShows = computed(() => contentWarningData.value?.shows.map(show => show.show) ?? [])

// Delete modal configuration
const deleteModalConfig = computed(() => {
  const hasShows = (contentWarningData.value?.shows ?? []).length > 0

  if (hasShows) {
    return {
      title: 'Deactivate Content Warning?',
      message: `This content warning is used by ${contentWarningData.value?.shows.length ?? 0} show(s) and cannot be permanently deleted. It will be deactivated instead.`,
      confirmText: 'Deactivate',
      variant: 'warning' as const,
    }
  }

  return {
    title: 'Delete Content Warning?',
    message: 'This content warning is not used by any shows and will be permanently deleted. This action cannot be undone.',
    confirmText: 'Delete Permanently',
    variant: 'danger' as const,
  }
})

// Delete handler
const handleDelete = async () => {
  if (!contentWarningData.value) return

  deleting.value = true
  try {
    await $fetch(`/api/admin/content-warnings/${contentWarningId}`, {
      method: 'DELETE',
    })

    // Navigate back to content warnings list
    await navigateTo('/admin/content-warnings')
  }
  catch (error: unknown) {
    const apiError = error as { data?: { message?: string } }
    // Handle error (could show toast notification)
    console.error('Failed to delete content warning:', apiError.data?.message || 'Unknown error')
  }
  finally {
    deleting.value = false
    showDeleteModal.value = false
  }
}

// Set page title
if (contentWarningData.value) {
  useHead({
    title: `${contentWarningData.value.name} - Content Warning Details`,
  })
}
</script>

<style scoped>
.content-warning-detail {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.content-warning-detail__header {
  margin-bottom: 32px;
}

.content-warning-detail__title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.content-warning-detail__title {
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-text-color);
  margin: 0;
}

.content-warning-detail__actions {
  display: flex;
  gap: 12px;
}

.content-warning-detail__loading,
.content-warning-detail__error {
  display: flex;
  justify-content: center;
  padding: 48px 24px;
}

.content-warning-detail__content {
  background: var(--surface-color);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.content-warning-detail__grid {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.related-shows {
  padding: 16px 24px;
}

.related-show-item {
  padding: 12px 0;
  border-bottom: 1px solid var(--border-color);
}

.related-show-item:last-child {
  border-bottom: none;
}

.related-show-title {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 500;
}

.related-show-link {
  color: var(--primary-color);
  text-decoration: none;
}

.related-show-link:hover {
  text-decoration: underline;
}

.related-show-info {
  margin: 0;
  font-size: 14px;
  color: var(--secondary-text-color);
}

.button--danger {
  background-color: var(--danger-color, #dc3545);
  border-color: var(--danger-color, #dc3545);
}

.button--danger:hover {
  background-color: var(--danger-hover-color, #c82333);
  border-color: var(--danger-hover-color, #c82333);
}

@media (max-width: 768px) {
  .content-warning-detail {
    padding: 16px;
  }

  .content-warning-detail__title-section {
    flex-direction: column;
    align-items: flex-start;
  }

  .content-warning-detail__actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .content-warning-detail__title {
    font-size: 20px;
  }
}

@media (max-width: 480px) {
  .content-warning-detail__actions {
    flex-direction: column;
  }
}
</style>
