<template>
  <div>
    <!-- Hero Section with full-width background -->
    <div class="relative w-full">
      <UPageHero
        title="The Nottingham New Theatre"
        description="England's only fully student-run theatre"
        :ui="{
          wrapper: 'relative overflow-hidden py-24 sm:py-32',
          container: 'relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
          title: 'text-4xl font-bold tracking-tight text-white sm:text-6xl',
          description: 'mt-6 text-lg leading-8 text-white/90',
        }"
      />
      <!-- Background -->
      <div class="absolute inset-0 -z-10">
        <img
          src="/images/nnt_front.jpg"
          alt="Nottingham New Theatre building front"
          class="w-full h-full object-cover"
        >
        <div class="absolute inset-0 bg-black/50" />
      </div>
    </div>

    <!-- Main Content -->
    <div class="py-12">
      <!-- What's On Section -->
      <UContainer>
        <div class="mb-8 flex justify-between items-center">
          <div>
            <h2 class="text-3xl font-bold mb-2">
              What's On
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              Discover our upcoming productions
            </p>
          </div>
          <UButton
            to="/whats-on"
            color="primary"
            variant="outline"
            size="lg"
          >
            View All Shows
          </UButton>
        </div>

        <!-- Loading State -->
        <div
          v-if="showsLoading"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <div
            v-for="i in 3"
            :key="i"
            class="border rounded-lg overflow-hidden"
          >
            <USkeleton class="h-48 w-full" />
            <div class="p-4">
              <USkeleton class="h-6 w-3/4 mb-2" />
              <USkeleton class="h-4 w-full mb-2" />
              <USkeleton class="h-4 w-5/6 mb-4" />
              <USkeleton class="h-8 w-24" />
            </div>
          </div>
        </div>

        <!-- Shows Grid -->
        <div
          v-else-if="upcomingShows.length > 0"
          class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <UCard
            v-for="show in upcomingShows.slice(0, 3)"
            :key="show.id"
            class="overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer"
            @click="navigateTo(`/shows/${show.slug}`)"
          >
            <template #header>
              <div class="relative h-48 overflow-hidden">
                <img
                  v-if="show.posterImageUrl"
                  :src="show.posterImageUrl"
                  :alt="`${show.title} poster`"
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                >
                <div
                  v-else
                  class="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center"
                >
                  <span class="text-white text-2xl font-bold">{{ show.title.charAt(0) }}</span>
                </div>
              </div>
            </template>

            <div class="space-y-3">
              <h3 class="text-xl font-semibold line-clamp-1">
                {{ show.title }}
              </h3>

              <p class="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {{ show.description }}
              </p>

              <div
                v-if="show.performances && show.performances.length > 0"
                class="text-sm text-gray-500 dark:text-gray-500"
              >
                <div class="flex items-center gap-2">
                  <UIcon
                    name="i-heroicons-calendar"
                    class="w-4 h-4"
                  />
                  <span>{{ formatPerformanceDates(show.performances) }}</span>
                </div>
              </div>

              <UButton
                color="primary"
                variant="soft"
                size="sm"
                class="w-full"
              >
                View Details & Book
              </UButton>
            </div>
          </UCard>
        </div>

        <!-- No Shows Message -->
        <UAlert
          v-else
          color="info"
          variant="soft"
          title="No Shows Currently Listed"
          description="Check back soon for our upcoming productions!"
          class="mb-8"
        />
      </UContainer>

      <!-- About Section -->
      <UContainer>
        <div class="mb-8">
          <h2 class="text-3xl font-bold mb-4">
            About Us
          </h2>
          <p>
            We are The Nottingham New Theatre, a student-run theatre. As part of the University of Nottingham Student’s Union (UoNSU) we have a membership of over 200 students every year. Students join us from a variety of courses and disciplines; from English to Engineering, undergraduate and postgraduate. Whether you’re keen to act, direct, work backstage or just watch an amazing show, there’s a place for you here!
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-6 mb-8">
          <UCard class="p-6">
            <h3 class="text-xl font-semibold mb-2">
              Inclusive Community
            </h3>
            <p>
              Students from all backgrounds welcome. No experience required!
            </p>
          </UCard>

          <UCard class="p-6">
            <h3 class="text-xl font-semibold mb-2">
              Student-Led
            </h3>
            <p>
              All shows are produced, directed, and performed by students.
            </p>
          </UCard>

          <UCard class="p-6">
            <h3 class="text-xl font-semibold mb-2">
              Year-Round
            </h3>
            <p>
              Multiple productions each term with ongoing opportunities.
            </p>
          </UCard>
        </div>

        <!-- Call to Action -->
        <UPageCTA
          title="Ready to Join Our Theatre Family?"
          description="Whether you're looking to step into the spotlight or work behind the scenes, we'd love to have you as part of our community."
          :links="[
            {
              label: 'Become a Member',
              to: 'https://su.nottingham.ac.uk/activities/view/new-theatre',
              color: 'primary',
              size: 'xl',
              external: true,
            },
            {
              label: 'Contact Us',
              to: 'mailto:boxoffice@newtheatre.org.uk',
              variant: 'outline',
              size: 'xl',
              external: true,
            },
          ]"
          class="mt-20"
        />
      </UContainer>
    </div>
  </div>
</template>

<script lang="ts" setup>
interface PerformanceForShow {
  id: string
  title: string
  startDateTime: string | Date
  runtimeMinutes: number
  intervalMinutes: number
}

interface ShowWithPerformances {
  id: string
  title: string
  slug: string
  description: string
  posterImageUrl: string | null
  status: string
  showType: string
  performances: PerformanceForShow[]
}

definePageMeta({
  layout: false,
  title: 'Home - The Nottingham New Theatre',
  description: 'A vibrant student-run theatre at the University of Nottingham. Join our community of creative students!',
})

// SEO
useSeoMeta({
  title: 'The Nottingham New Theatre - Student-Run Theatre',
  ogTitle: 'The Nottingham New Theatre',
  description: 'A vibrant student-run theatre at the University of Nottingham. Join our community of over 200 students from all courses and disciplines.',
  ogDescription: 'A vibrant student-run theatre at the University of Nottingham. Join our community of over 200 students from all courses and disciplines.',
  ogImage: '/images/nnt_front.jpg',
  twitterCard: 'summary_large_image',
})

// Fetch upcoming shows
const { data: showsData, status: showsStatus } = await useFetch<{
  success: boolean
  data: ShowWithPerformances[]
}>('/api/v1/shows/whats-on')

const upcomingShows = computed(() => showsData.value?.data || [])
const showsLoading = computed(() => showsStatus.value === 'pending')

// Format performance dates
function formatPerformanceDates(performances: PerformanceForShow[]) {
  if (!performances || performances.length === 0) {
    return 'Dates TBA'
  }

  const dates = performances.map(p => new Date(p.startDateTime))
  const sortedDates = dates.sort((a, b) => a.getTime() - b.getTime())

  const firstDate = sortedDates[0]
  const lastDate = sortedDates[sortedDates.length - 1]

  if (!firstDate || !lastDate) {
    return 'Dates TBA'
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  if (sortedDates.length === 1) {
    return formatDate(firstDate)
  }

  // If same month and year, show as range
  if (
    firstDate.getMonth() === lastDate.getMonth()
    && firstDate.getFullYear() === lastDate.getFullYear()
  ) {
    return `${firstDate.getDate()}-${lastDate.getDate()} ${firstDate.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`
  }

  return `${formatDate(firstDate)} - ${formatDate(lastDate)}`
}
</script>
