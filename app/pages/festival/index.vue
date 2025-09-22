<template>
  <div>
    <!-- Background image positioning for hero -->
    <div class="relative w-full">
      <ContentRenderer
        v-if="page?.body"
        :value="page"
        class="prose-none"
      />
    </div>
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
