<script setup lang="ts">
import Square from './Square.vue'
</script>

<template>
  <div
    class="bg-(--theme-text)/40 relative aspect-square rounded-lg transition-colors duration-1000 ease-in-out"
  >
    <div class="flex animate-pulse cursor-wait items-center justify-center">
      <Square>
        <div class="size-8 rounded-md bg-current opacity-20" />
      </Square>
    </div>
  </div>
</template>
