<template>
  <UContainer>
    <div class="py-8 space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">
            Front of House Dashboard
          </h1>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {{ formatDate(new Date()) }}
          </p>
        </div>
        <div class="flex gap-3">
          <UButton
            icon="i-lucide-ticket"
            color="primary"
            @click="navigateTo('/admin/foh/performances')"
          >
            View Performances
          </UButton>
        </div>
      </div>

      <!-- Error Alert -->
      <UAlert
        v-if="error"
        icon="i-lucide-alert-circle"
        color="error"
        variant="soft"
        :title="error.message || 'Failed to load data'"
      />

      <!-- Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <UCard>
          <div class="flex items-center gap-4">
            <div class="shrink-0">
              <UIcon
                name="i-lucide-calendar-check"
                class="text-3xl text-blue-500"
              />
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Performances
              </p>
              <p class="text-2xl font-bold">
                {{ performances.length }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center gap-4">
            <div class="shrink-0">
              <UIcon
                name="i-lucide-ticket"
                class="text-3xl text-yellow-500"
              />
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Total Reservations
              </p>
              <p class="text-2xl font-bold">
                {{ totalReservations }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center gap-4">
            <div class="shrink-0">
              <UIcon
                name="i-lucide-clock"
                class="text-3xl text-orange-500"
              />
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Pending Collection
              </p>
              <p class="text-2xl font-bold">
                {{ totalPending }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center gap-4">
            <div class="shrink-0">
              <UIcon
                name="i-lucide-check-circle"
                class="text-3xl text-green-500"
              />
            </div>
            <div>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                Collected
              </p>
              <p class="text-2xl font-bold">
                {{ totalCollected }}
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Upcoming Performances -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon
                name="i-lucide-calendar"
                class="text-xl"
              />
              <h2 class="text-xl font-semibold">
                Upcoming Performances
              </h2>
            </div>
            <UButton
              icon="i-lucide-arrow-right"
              color="neutral"
              variant="ghost"
              size="sm"
              @click="navigateTo('/admin/foh/performances')"
            >
              View All
            </UButton>
          </div>
        </template>

        <div
          v-if="pending"
          class="flex justify-center py-12"
        >
          <UIcon
            name="i-lucide-loader-circle"
            class="text-4xl animate-spin"
          />
        </div>

        <UEmpty
          v-else-if="performances.length === 0"
          icon="i-lucide-calendar-x"
          title="No performances scheduled"
          description="There are no upcoming performances at this time."
        />

        <div
          v-else
          class="divide-y divide-gray-200 dark:divide-gray-800"
        >
          <div
            v-for="performance in performances.slice(0, 5)"
            :key="performance.id"
            class="py-4 hover:bg-gray-50 dark:hover:bg-gray-900 px-4 -mx-4 cursor-pointer transition-colors"
            @click="navigateTo(`/admin/foh/performances/${performance.id}/reservations`)"
          >
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <h3 class="font-semibold text-lg">
                  {{ performance.title }}
                </h3>
                <div class="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <span class="flex items-center gap-1">
                    <UIcon name="i-lucide-map-pin" />
                    {{ performance.venue?.name || 'TBA' }}
                  </span>
                  <span class="flex items-center gap-1">
                    <UIcon name="i-lucide-clock" />
                    {{ formatDateTime(performance.startDateTime) }}
                  </span>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <UBadge
                  :color="performance._counts.reservationsCollected > 0 ? 'success' : 'neutral'"
                  variant="subtle"
                >
                  {{ performance._counts.reservationsCollected }} collected
                </UBadge>
                <UBadge
                  :color="performance._counts.reservationsTotal - performance._counts.reservationsCollected > 0 ? 'warning' : 'neutral'"
                  variant="subtle"
                >
                  {{ performance._counts.reservationsTotal - performance._counts.reservationsCollected }} pending
                </UBadge>
              </div>
            </div>
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin'],
})

const { data: performances = [], pending, error } = await useFetch('/api/v2/performances')

const totalReservations = computed(() =>
  performances.value.reduce((sum, p) => sum + p._counts.reservationsTotal, 0),
)

const totalPending = computed(() =>
  performances.value.reduce(
    (sum, p) => sum + (p._counts.reservationsTotal - p._counts.reservationsCollected),
    0,
  ),
)

const totalCollected = computed(() =>
  performances.value.reduce((sum, p) => sum + p._counts.reservationsCollected, 0),
)

function formatDate(date: Date) {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatDateTime(dateTime: string) {
  const date = new Date(dateTime)
  return date.toLocaleString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>
