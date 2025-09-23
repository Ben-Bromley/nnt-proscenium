<template>
  <div>
    <!-- View a list of shows/events/stuff performances -->
    <UPageHero
      title="What's On"
    />
    <UAlert
      color="info"
      variant="soft"
      description="There are currnently no upcoming shows or events. Please check back after our season launch on the 15th of October!"
    />
    <br>
    <!-- Skeleton Grid - mimicking UBlogPosts layout -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      <!-- Skeleton Card 1 -->
      <div class="border rounded-lg overflow-hidden">
        <USkeleton class="h-48 w-full" />
        <div class="p-4">
          <USkeleton class="h-6 w-3/4 mb-2" />
          <USkeleton class="h-4 w-full mb-2" />
          <USkeleton class="h-4 w-5/6 mb-4" />
          <USkeleton class="h-8 w-24" />
        </div>
      </div>

      <!-- Skeleton Card 2 -->
      <div class="border rounded-lg overflow-hidden">
        <USkeleton class="h-48 w-full" />
        <div class="p-4">
          <USkeleton class="h-6 w-2/3 mb-2" />
          <USkeleton class="h-4 w-full mb-2" />
          <USkeleton class="h-4 w-4/5 mb-4" />
          <USkeleton class="h-8 w-24" />
        </div>
      </div>

      <!-- Skeleton Card 3 -->
      <div class="border rounded-lg overflow-hidden">
        <USkeleton class="h-48 w-full" />
        <div class="p-4">
          <USkeleton class="h-6 w-5/6 mb-2" />
          <USkeleton class="h-4 w-full mb-2" />
          <USkeleton class="h-4 w-3/4 mb-4" />
          <USkeleton class="h-8 w-24" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  title: 'What\'s On',
})
</script>

<style scoped>

</style>
