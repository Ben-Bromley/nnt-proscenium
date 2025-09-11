<template>
  <div>
    <!-- Hero Section -->
    <UPageHero
      title="Get Involved"
      description="Join England's only fully student-run theatre. Whether you want to spend an evening with us or dedicate the whole week - there's always something to do."
    />

    <UContainer>
      <!-- Introduction -->
      <!-- <div class="mb-12 text-center">
          <p class="text-lg max-w-3xl mx-auto">
            With fifteen shows a semester and dedicated casts and crews for each, there's an opportunity for everyone!
            Membership to the NNT is affordable, whether you're interested in acting, directing, technical work, or anything in between.
          </p>
        </div> -->

      <!-- Main Ways to Get Involved -->
      <div class="mb-16">
        <h2 class="text-3xl font-bold mb-8">
          How to Get Started
        </h2>

        <UPageGrid>
          <UPageCard
            title="Join Our Mailing List"
            description="Stay up to date with all our shows, auditions, and opportunities. This is the best way to never miss out on what's happening."
            icon="i-lucide-mail"
          >
            <template #footer>
              <UButton
                to="/mailing-list"
                color="primary"
                size="lg"
                block
              >
                Subscribe Now
              </UButton>
            </template>
          </UPageCard>

          <UPageCard
            title="Come to Season Launch"
            description="Our season launches are the perfect opportunity to discover all available roles and meet the creative teams for upcoming shows."
            icon="i-lucide-calendar"
          >
            <template #footer>
              <UButton
                to="/calendar"
                color="secondary"
                size="lg"
                block
              >
                View Calendar
              </UButton>
            </template>
          </UPageCard>

          <UPageCard
            title="Follow Our Socials"
            description="Keep up with behind-the-scenes content, announcements, and connect with the NNT community on social media."
            icon="i-lucide-users"
          >
            <template #footer>
              <div class="flex gap-2 justify-center">
                <UButton
                  to="https://facebook.com/thenottinghamnewtheatre"
                  external
                  icon="icon:facebook"
                  color="gray"
                  variant="outline"
                />
                <UButton
                  to="https://instagram.com/nottinghamnewtheatre"
                  external
                  icon="icon:instagram"
                  color="gray"
                  variant="outline"
                />
              </div>
            </template>
          </UPageCard>
        </UPageGrid>
      </div>

      <!-- Areas to Get Involved -->
      <div class="mb-16">
        <h2 class="text-3xl font-bold mb-4">
          Areas to Explore
        </h2>
        <p class="text-lg mb-8">
          From performing on stage to working behind the scenes, there are countless ways to contribute to our productions.
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <!-- Performance -->
          <UCard>
            <div class="text-center">
              <div class="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UIcon
                  name="i-lucide-theater"
                  class="w-6 h-6 text-primary"
                />
              </div>
              <h3 class="text-xl font-semibold mb-2">
                Performance
              </h3>
              <p class="text-gray-500 dark:text-gray-400 mb-4">
                Acting, directing, producing, and writing for our diverse range of productions.
              </p>
              <UButton
                to="/wiki/productions"
                variant="outline"
                size="sm"
                block
              >
                Learn More
              </UButton>
            </div>
          </UCard>

          <!-- Technical -->
          <UCard>
            <div class="text-center">
              <div class="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UIcon
                  name="i-lucide-settings"
                  class="w-6 h-6 text-primary"
                />
              </div>
              <h3 class="text-xl font-semibold mb-2">
                Technical
              </h3>
              <p class="text-gray-500 dark:text-gray-400 mb-4">
                Lighting, sound, video design, rigging, and technical direction for our shows.
              </p>
              <UButton
                to="/wiki/technical"
                variant="outline"
                size="sm"
                block
              >
                Learn More
              </UButton>
            </div>
          </UCard>

          <!-- Creative -->
          <UCard>
            <div class="text-center">
              <div class="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UIcon
                  name="i-lucide-palette"
                  class="w-6 h-6 text-primary"
                />
              </div>
              <h3 class="text-xl font-semibold mb-2">
                Creative
              </h3>
              <p class="text-gray-500 dark:text-gray-400 mb-4">
                Set design, costume, props, make-up, marketing, and publicity roles.
              </p>
              <UButton
                to="/wiki/productions"
                variant="outline"
                size="sm"
                block
              >
                Learn More
              </UButton>
            </div>
          </UCard>

          <!-- Stage Management -->
          <UCard>
            <div class="text-center">
              <div class="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UIcon
                  name="i-lucide-clipboard-list"
                  class="w-6 h-6 text-primary"
                />
              </div>
              <h3 class="text-xl font-semibold mb-2">
                Stage Management
              </h3>
              <p class="text-gray-500 dark:text-gray-400 mb-4">
                Keep productions running smoothly behind the scenes during rehearsals and performances.
              </p>
              <UButton
                to="/wiki/productions"
                variant="outline"
                size="sm"
                block
              >
                Learn More
              </UButton>
            </div>
          </UCard>

          <!-- Website & Development -->
          <UCard>
            <div class="text-center">
              <div class="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UIcon
                  name="i-lucide-code"
                  class="w-6 h-6 text-primary"
                />
              </div>
              <h3 class="text-xl font-semibold mb-2">
                Website & Tech
              </h3>
              <p class="text-gray-500 dark:text-gray-400 mb-4">
                Help develop and maintain our website, ticketing system, and digital presence.
              </p>
              <UButton
                to="/wiki/website"
                variant="outline"
                size="sm"
                block
              >
                Learn More
              </UButton>
            </div>
          </UCard>

          <!-- Committee & Governance -->
          <UCard>
            <div class="text-center">
              <div class="mx-auto mb-4 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <UIcon
                  name="i-lucide-users-2"
                  class="w-6 h-6 text-primary"
                />
              </div>
              <h3 class="text-xl font-semibold mb-2">
                Committee
              </h3>
              <p class="text-gray-500 dark:text-gray-400 mb-4">
                Take on leadership roles and help shape the future direction of the theatre.
              </p>
              <UButton
                to="/wiki/governance"
                variant="outline"
                size="sm"
                block
              >
                Learn More
              </UButton>
            </div>
          </UCard>
        </div>
      </div>

      <!-- Membership Information -->
      <UPageCTA
        title="Become a Member"
        description="Joining the Nottingham New Theatre as a member gives you access to auditions, workshops, and the chance to get involved in any aspect of our productions. Membership is affordable and open to all students."
        class="mb-16"
        :links="[
          {
            label: 'Join Now',
            to: 'https://su.nottingham.ac.uk/activities/view/new-theatre',
            color: 'primary',
            size: 'xl',
            external: true,
          },
        ]"
      />

      <!-- Quick Links -->
      <div class="mb-16">
        <h2 class="text-3xl font-bold mb-8">
          Quick Links
        </h2>

        <UAlert
          color="info"
          class="mb-8"
          title="Coming Soon!"
          description="More detailed guides and resources on getting involved will be available here soon."
        />

        <!-- <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold mb-2">
                  Current Season & Auditions
                </h3>
                <p class="text-gray-500 dark:text-gray-400 text-sm">
                  See what's currently casting and upcoming opportunities
                </p>
              </div>
              <UButton
                to="/whats-on"
                icon="i-lucide-arrow-right"
                color="primary"
                variant="ghost"
              />
            </div>
          </UCard>

          <UCard>
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-semibold mb-2">
                  Complete Wiki Guide
                </h3>
                <p class="text-gray-500 dark:text-gray-400 text-sm">
                  Detailed information about all aspects of the theatre
                </p>
              </div>
              <UButton
                to="/wiki"
                icon="i-lucide-arrow-right"
                color="primary"
                variant="ghost"
              />
            </div>
          </UCard>
        </div> -->
      </div>

      <!-- Contact Section -->
      <UPageCTA
        title="Questions?"
        description="If you have any questions about getting involved or want to know more about specific roles,
            don't hesitate to get in touch. We're always happy to help!"
      >
        <template #links>
          <UButton
            to="mailto:boxoffice@newtheatre.org.uk"
            external
            color="primary"
            size="lg"
            icon="i-lucide-mail"
          >
            Contact Us
          </UButton>
        </template>
      </UPageCTA>
    </UContainer>
  </div>
</template>

<script setup>
useSeoMeta({
  title: 'Get Involved - Nottingham New Theatre',
  description: 'Join England\'s only fully student-run theatre. From acting and directing to technical work and creative roles, there\'s an opportunity for everyone at the NNT.',
  ogTitle: 'Get Involved - Nottingham New Theatre',
  ogDescription: 'Join England\'s only fully student-run theatre. From acting and directing to technical work and creative roles, there\'s an opportunity for everyone at the NNT.',
  ogImage: '/images/banners/get-involved.jpg',
  twitterCard: 'summary_large_image',
})
</script>
