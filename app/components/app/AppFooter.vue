<template>
  <UFooter>
    <template #top>
      <UContainer>
        <USeparator color="neutral" />
      </UContainer>
    </template>

    <template #left>
      <div class="flex flex-col items-start gap-4">
        <h3 class="text-lg font-semibold">
          Find Us On Social Media
        </h3>
        <div class="flex items-center gap-3">
          <ULink
            v-for="social in socials"
            :key="social.url"
            :to="social.url"
            target="_blank"
            class="text-2xl hover:text-secondary"
          >
            <UIcon
              :name="social.icon"
              size="lg"
            />
          </ULink>
        </div>
      </div>
    </template>

    <template #right>
      <UNavigationMenu
        :items="links"
        orientation="vertical"
        variant="link"
        class="right"
      />
    </template>

    <template #bottom>
      <div class="flex flex-col md:flex-row justify-center items-center gap-2 md:gap-4 text-sm text-muted text-center">
        <p>
          Copyright &copy; {{ new Date().getFullYear() }} Nottingham New Theatre
        </p>
        <span class="hidden md:inline">&bull;</span>
        <div class="flex gap-4 items-center">
          <p>
            Part of <ULink
              to="https://su.nottingham.ac.uk"
              target="_blank"
              class="text-secondary hover:underline hover:text-secondary"
            >UoNSU</ULink>
          </p>
          <span>&bull;</span>
          <p>
            Source on <ULink
              to="https://github.com/newtheatre/proscenium/"
              target="_blank"
              class="text-secondary hover:underline hover:text-secondary"
            >GitHub</ULink>
          </p>
        </div>
      </div>
    </template>
  </UFooter>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

interface SocialLink {
  icon: string
  url: string
  label: string
}

// Social media links
const socials: SocialLink[] = [
  {
    icon: 'icon:email',
    url: 'mailto:boxoffice@newtheatre.org.uk',
    label: 'Email',
  },
  {
    icon: 'icon:facebook',
    url: 'https://www.facebook.com/thenottinghamnewtheatre/',
    label: 'Facebook',
  },
  {
    icon: 'icon:instagram',
    url: 'https://www.instagram.com/nottinghamnewtheatre/',
    label: 'Instagram',
  },
  {
    icon: 'icon:su',
    url: 'https://su.nottingham.ac.uk/activities/view/new-theatre',
    label: 'Student Union',
  },
]

// Navigation links
const links: NavigationMenuItem[] = [
  {
    label: 'Wiki & Resources',
    to: '/wiki',
  },
  {
    label: 'Branding',
    to: '/branding',
  },
  {
    label: 'Mailing List',
    to: '/mailing-list',
  },
  {
    label: 'History',
    to: 'http://history.newtheatre.org.uk/',
    target: '_blank',
  },
  {
    label: 'Photo Gallery',
    to: 'http://photos.newtheatre.org.uk/',
    target: '_blank',
  },
]
</script>
