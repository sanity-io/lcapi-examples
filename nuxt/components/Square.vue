<script setup lang="ts">
defineProps<{
  class?: string
}>()
</script>

<template>
  <div class="inline-flex aspect-square size-12 items-center justify-center">
    <slot/>
  </div>
</template>