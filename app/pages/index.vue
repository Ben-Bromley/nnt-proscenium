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
        <div class="mb-8">
          <h2 class="text-3xl font-bold mb-4">
            What's On
          </h2>
          <p>
            We're working on this section to bring you upcoming show information.
          </p>
        </div>

        <!-- Skeleton Grid - mimicking UBlogPosts layout -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <!-- Skeleton Card 1 -->
          <div class="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <USkeleton class="h-48 w-full" />
            <div class="p-4">
              <USkeleton class="h-6 w-3/4 mb-2" />
              <USkeleton class="h-4 w-full mb-2" />
              <USkeleton class="h-4 w-5/6 mb-4" />
              <USkeleton class="h-8 w-24" />
            </div>
          </div>

          <!-- Skeleton Card 2 -->
          <div class="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <USkeleton class="h-48 w-full" />
            <div class="p-4">
              <USkeleton class="h-6 w-2/3 mb-2" />
              <USkeleton class="h-4 w-full mb-2" />
              <USkeleton class="h-4 w-4/5 mb-4" />
              <USkeleton class="h-8 w-24" />
            </div>
          </div>

          <!-- Skeleton Card 3 -->
          <div class="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
            <USkeleton class="h-48 w-full" />
            <div class="p-4">
              <USkeleton class="h-6 w-5/6 mb-2" />
              <USkeleton class="h-4 w-full mb-2" />
              <USkeleton class="h-4 w-3/4 mb-4" />
              <USkeleton class="h-8 w-24" />
            </div>
          </div>
        </div>

        <UAlert
          color="info"
          variant="soft"
          title="Coming Soon"
          description="Show listings and booking information will be available here soon. Stay tuned!"
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
            We are The Nottingham New Theatre, a student-run theatre and part of the University of Nottingham Student's Union.
            Students join us from all courses and disciplines, whether you want to act, direct, or work backstage.
          </p>
        </div>

        <div class="grid md:grid-cols-3 gap-6 mb-8">
          <UCard class="p-6">
            <h3 class="text-xl font-semibold mb-2">
              Inclusive Community
            </h3>
            <p>
              Welcome students from all backgrounds. No experience required!
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
</script>
