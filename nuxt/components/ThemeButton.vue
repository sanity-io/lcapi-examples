<script setup lang="ts">
import {ref} from 'vue'

const isPending = ref(false)

async function handleClick() {
  isPending.value = true
  try {
    await fetch('https://lcapi-examples-api.sanity.dev/api/random-color-theme', {
      method: 'PUT',
    })
    await new Promise((resolve) => setTimeout(resolve, 1_000))
  } finally {
    isPending.value = false
  }
}
</script>

<template>
  <button
    :disabled="isPending"
    class="select-none bg-(--theme-text) text-(--theme-background) focus:ring-(--theme-text) focus:ring-offset-(--theme-background) focus:outline-hidden cursor-pointer rounded-md px-4 py-2 text-sm font-semibold transition ease-in-out focus:ring-2 focus:ring-offset-2 focus:duration-0 disabled:cursor-not-allowed disabled:opacity-50"
    :class="isPending ? 'animate-pulse cursor-wait duration-150' : 'duration-1000'"
    @click="handleClick"
  >
    {{ isPending ? 'Generating...' : 'Random Color Theme' }}
  </button>
</template>
