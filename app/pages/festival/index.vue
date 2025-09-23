<template>
  <div>
    <!-- Background image positioning for hero -->
    <UPageHero
      :title="page?.title"
      :subtitle="page?.description"
      class="mb-8"
    />
    <UContainer>
      <ContentRenderer
        v-if="page?.body"
        :value="page"
        class="prose-none"
      />
    </UContainer>
  </div>
</template>

<script lang="ts" setup>
// Fetch content from Nuxt Content
const page = await queryCollection('pages').path('/pages/festival').first()

definePageMeta({
  layout: false,
  title: 'StuFF - Student Fringe Festival',
})
</script>
