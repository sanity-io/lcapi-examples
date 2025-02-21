<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
interface Props {
  data: {
    _key: string
    _ref: string
  }[]
}

defineProps<Props>()
</script>

<template>
  <aside
    class="bg-(--theme-text)/30 fixed bottom-2 left-[50%] grid -translate-x-[50%] grid-flow-col grid-rows-1 gap-2 rounded-2xl p-2 transition-colors duration-1000 ease-in-out"
  >
    <Reaction v-for="{_key, _ref} in data" :key="_key" :_ref="_ref" />
  </aside>
</template>
