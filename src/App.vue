<script setup lang="ts">
import KiPreloader from '@/components/layout/ki-preloader/ki-preloader.vue'
import { ref } from 'vue'
const kiPreloader = ref<InstanceType<typeof KiPreloader> | undefined>(undefined)
setTimeout(() => {
  if (kiPreloader.value !== undefined) {
    kiPreloader.value.finished()
  }
}, 1200)
</script>

<template>
  <!-- <RouterView /> -->
  <ki-preloader ref="kiPreloader"></ki-preloader>
</template>

<style scoped></style>
