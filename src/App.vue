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
  <Teleport to="body">
    <ki-preloader ref="kiPreloader"></ki-preloader>
  </Teleport>
</template>

<style lang="scss" scoped></style>
