<template>
  <div class="show-detail">
    <div
      v-if="pending"
      class="loading-state"
    >
      <div class="flex items-center gap-2">
        <UIcon
          name="i-lucide-loader-2"
          class="animate-spin"
        />
        <span>Loading show details...</span>
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
      class="show-detail__content"
    >
      <header class="show-detail__header">
        <div class="show-detail__title-section">
          <div>
            <h1 class="show-detail__title">
              {{ show.title }}
            </h1>
            <p class="show-detail__slug">
              /shows/{{ show.slug }}
            </p>
          </div>
          <div class="show-detail__actions">
            <UButton
              color="primary"
              icon="i-lucide-edit"
              @click="navigateTo(`/admin/shows/${show.id}/edit`)"
            >
              Edit Show
            </UButton>
            <UButton
              color="neutral"
              variant="ghost"
              @click="navigateTo('/admin/shows')"
            >
              Back to Shows
            </UButton>
          </div>
        </div>
      </header>

      <div class="show-detail__grid">
        <!-- Basic Information Card -->
        <UCard>
          <template #header>
            <h2 class="card-title">
              Basic Information
            </h2>
          </template>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Status</span>
              <UBadge
                :color="getStatusColor(show.status)"
                variant="soft"
              >
                {{ formatStatus(show.status) }}
              </UBadge>
            </div>

            <div class="info-item">
              <span class="info-label">Show Type</span>
              <span class="info-value">{{ formatShowType(show.showType) }}</span>
            </div>

            <div
              v-if="show.ageRating"
              class="info-item"
            >
              <span class="info-label">Age Rating</span>
              <span class="info-value">{{ show.ageRating }}</span>
            </div>

            <div class="info-item info-item--full">
              <span class="info-label">Description</span>
              <p class="info-description">
                {{ show.description }}
              </p>
            </div>

            <div
              v-if="show.posterImageUrl"
              class="info-item info-item--full"
            >
              <span class="info-label">Poster Image</span>
              <a
                :href="show.posterImageUrl"
                target="_blank"
                class="info-link"
              >
                {{ show.posterImageUrl }}
              </a>
            </div>

            <div
              v-if="show.programmeUrl"
              class="info-item info-item--full"
            >
              <span class="info-label">Programme</span>
              <a
                :href="show.programmeUrl"
                target="_blank"
                class="info-link"
              >
                {{ show.programmeUrl }}
              </a>
            </div>
          </div>
        </UCard>

        <!-- Performances Card -->
        <UCard>
          <template #header>
            <div class="flex justify-between items-center">
              <h2 class="card-title">
                Performances ({{ show.performances?.length || 0 }})
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
          </template>

          <div
            v-if="!show.performances || show.performances.length === 0"
            class="empty-state"
          >
            <UIcon
              name="i-lucide-calendar-off"
              class="empty-icon"
            />
            <p class="empty-text">
              No performances scheduled yet
            </p>
            <UButton
              color="primary"
              variant="outline"
              size="sm"
              @click="addPerformance"
            >
              Add First Performance
            </UButton>
          </div>

          <div
            v-else
            class="performances-list"
          >
            <div
              v-for="performance in show.performances"
              :key="performance.id"
              class="performance-item"
            >
              <div class="performance-info">
                <h3 class="performance-title">
                  {{ performance.title }}
                </h3>
                <div class="performance-details">
                  <div class="performance-meta">
                    <UIcon
                      name="i-lucide-calendar"
                      class="meta-icon"
                    />
                    <span>{{ formatDateTime(performance.startDateTime) }}</span>
                  </div>
                  <div
                    v-if="performance.venue"
                    class="performance-meta"
                  >
                    <UIcon
                      name="i-lucide-map-pin"
                      class="meta-icon"
                    />
                    <span>{{ performance.venue.name }}</span>
                  </div>
                  <div class="performance-meta">
                    <UIcon
                      name="i-lucide-users"
                      class="meta-icon"
                    />
                    <span>{{ performance.maxCapacity === -1 ? 'Unlimited' : performance.maxCapacity }} capacity</span>
                  </div>
                </div>
                <UBadge
                  :color="getPerformanceStatusColor(performance.status)"
                  variant="soft"
                  size="sm"
                >
                  {{ formatPerformanceStatus(performance.status) }}
                </UBadge>
              </div>
              <div class="performance-actions">
                <UButton
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  icon="i-lucide-eye"
                  @click="navigateTo(`/admin/performances/${performance.id}`)"
                />
                <UButton
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  icon="i-lucide-edit"
                  @click="editPerformance(performance.id)"
                />
              </div>
            </div>
          </div>
        </UCard>

        <!-- Content Warnings Card -->
        <UCard v-if="show.contentWarnings && show.contentWarnings.length > 0">
          <template #header>
            <h2 class="card-title">
              Content Warnings ({{ show.contentWarnings.length }})
            </h2>
          </template>

          <div class="content-warnings-list">
            <div
              v-for="warning in show.contentWarnings"
              :key="warning.contentWarning.id"
              class="warning-item"
            >
              <div class="warning-info">
                <span
                  v-if="warning.contentWarning.icon"
                  class="warning-icon"
                >{{ warning.contentWarning.icon }}</span>
                <div>
                  <div class="warning-name">
                    {{ warning.contentWarning.name }}
                  </div>
                  <div
                    v-if="warning.notes"
                    class="warning-notes"
                  >
                    {{ warning.notes }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- Induction Card -->
        <UCard v-if="show.induction">
          <template #header>
            <h2 class="card-title">
              Show Induction
            </h2>
          </template>

          <div class="info-grid">
            <div class="info-item info-item--full">
              <span class="info-label">Induction Status</span>
              <UBadge
                :color="show.induction.inductionCompleted ? 'success' : 'warning'"
                variant="soft"
              >
                {{ show.induction.inductionCompleted ? 'Completed' : 'Pending' }}
              </UBadge>
            </div>

            <div class="info-item info-item--full">
              <span class="info-label">Risk Assessment</span>
              <UBadge
                :color="show.induction.riskAssessmentCompleted ? 'success' : 'warning'"
                variant="soft"
              >
                {{ show.induction.riskAssessmentCompleted ? 'Completed' : 'Pending' }}
              </UBadge>
            </div>

            <div
              v-if="show.induction.companyContactName"
              class="info-item"
            >
              <span class="info-label">Contact Name</span>
              <span class="info-value">{{ show.induction.companyContactName }}</span>
            </div>

            <div
              v-if="show.induction.companyContactEmail"
              class="info-item"
            >
              <span class="info-label">Contact Email</span>
              <a
                :href="`mailto:${show.induction.companyContactEmail}`"
                class="info-link"
              >
                {{ show.induction.companyContactEmail }}
              </a>
            </div>

            <div
              v-if="show.induction.technicalRequirements"
              class="info-item info-item--full"
            >
              <span class="info-label">Technical Requirements</span>
              <p class="info-description">
                {{ show.induction.technicalRequirements }}
              </p>
            </div>

            <div
              v-if="show.induction.inductionNotes"
              class="info-item info-item--full"
            >
              <span class="info-label">Induction Notes</span>
              <p class="info-description">
                {{ show.induction.inductionNotes }}
              </p>
            </div>
          </div>
        </UCard>

        <!-- Metadata Card -->
        <UCard>
          <template #header>
            <h2 class="card-title">
              Metadata
            </h2>
          </template>

          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Created</span>
              <span class="info-value">{{ formatDateTime(show.createdAt) }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Last Updated</span>
              <span class="info-value">{{ formatDateTime(show.updatedAt) }}</span>
            </div>

            <div class="info-item">
              <span class="info-label">Show ID</span>
              <code class="info-code">{{ show.id }}</code>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'admin',
  layout: 'admin',
})

const route = useRoute()
const showId = route.params.id as string

const { data: response, pending, error } = await useFetch(`/api/v1/admin/shows/${showId}`)

const show = computed(() => response.value?.data)

// Formatters
const { formatDateTime } = useFormatters()

function formatStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function formatShowType(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function formatPerformanceStatus(status: string) {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function getStatusColor(status: string): 'neutral' | 'success' | 'error' {
  const colorMap: Record<string, 'neutral' | 'success' | 'error'> = {
    DRAFT: 'neutral',
    PUBLISHED: 'success',
    CANCELLED: 'error',
  }
  return colorMap[status] || 'neutral'
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

function addPerformance() {
  navigateTo(`/admin/shows/${showId}/performances/new`)
}

function editPerformance(performanceId: string) {
  navigateTo(`/admin/performances/${performanceId}/edit`)
}
</script>

<style scoped>
.show-detail {
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

.show-detail__header {
  margin-bottom: 32px;
}

.show-detail__title-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;
}

.show-detail__title {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.show-detail__slug {
  font-family: monospace;
  font-size: 14px;
  color: var(--color-gray-600);
  margin: 0;
}

.show-detail__actions {
  display: flex;
  gap: 8px;
}

.show-detail__grid {
  display: grid;
  gap: 24px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item--full {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--color-gray-600);
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 14px;
  color: var(--color-gray-900);
}

.info-description {
  font-size: 14px;
  color: var(--color-gray-700);
  line-height: 1.5;
  margin: 0;
}

.info-link {
  font-size: 14px;
  color: var(--color-primary-600);
  text-decoration: none;
}

.info-link:hover {
  text-decoration: underline;
}

.info-code {
  font-family: monospace;
  font-size: 13px;
  padding: 4px 8px;
  background: var(--color-gray-100);
  border-radius: 4px;
  color: var(--color-gray-800);
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 16px;
  text-align: center;
}

.empty-icon {
  font-size: 48px;
  color: var(--color-gray-400);
}

.empty-text {
  font-size: 14px;
  color: var(--color-gray-600);
  margin: 0;
}

.performances-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.performance-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--color-gray-200);
  border-radius: 8px;
  transition: border-color 0.2s;
}

.performance-item:hover {
  border-color: var(--color-gray-300);
}

.performance-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.performance-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.performance-details {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 14px;
  color: var(--color-gray-600);
}

.performance-meta {
  display: flex;
  align-items: center;
  gap: 4px;
}

.meta-icon {
  font-size: 14px;
}

.performance-actions {
  display: flex;
  gap: 4px;
}

.content-warnings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.warning-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: var(--color-gray-50);
  border-radius: 6px;
}

.warning-info {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  flex: 1;
}

.warning-icon {
  font-size: 20px;
}

.warning-name {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
}

.warning-notes {
  font-size: 13px;
  color: var(--color-gray-600);
}

@media (min-width: 768px) {
  .show-detail__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
