<template>
  <div class="h-full flex flex-col">
    <p class="font-semibold text-xl mb-4">Map</p>
    <div class="flex-1 bg-gray-50 rounded p-4">
      <p>Map placeholder</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  dashboardData: Object,
  userToken: String
})
</script>
