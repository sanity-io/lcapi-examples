<script setup lang="ts">
import {onMounted, ref} from 'vue'
import type {Emoji} from './types'

const props = defineProps<{
  _key: string
  emoji: string
  delay: number
  emojis: Emoji[]
}>()

const emit = defineEmits<{
  'update:emojis': [emojis: Emoji[]]
}>()

const element = ref<HTMLDivElement>()
const randomOffset = (Math.random() - 0.5) * 200
const randomDelay = props.delay ? Math.random() * 0.15 : 0

onMounted(() => {
  if (!element.value) return

  const animation = element.value.animate(
    [
      {
        opacity: 0,
        transform: 'scale(0.5) translateY(0) translateX(0)',
      },
      {
        opacity: 1,
        transform: `scale(1.2) translateY(-10dvh) translateX(${randomOffset * 0.3}px)`,
        offset: 0.1,
      },
      {
        opacity: 1,
        transform: `scale(1) translateY(-20dvh) translateX(${randomOffset * 0.5}px)`,
        offset: 0.2,
      },
      {
        opacity: 1,
        transform: `scale(1) translateY(-80dvh) translateX(${randomOffset * 0.8}px)`,
        offset: 0.8,
      },
      {
        opacity: 0,
        transform: `scale(0.8) translateY(-116dvh) translateX(${randomOffset}px)`,
      },
    ],
    {
      duration: 4000 - randomDelay * 1000,
      delay: props.delay + randomDelay * 1000,
      easing: 'ease-out',
      fill: 'forwards',
    },
  )

  animation.onfinish = () => {
    emit(
      'update:emojis',
      props.emojis.map((e) => (e.key === props._key ? {...e, done: true} : e)),
    )
  }
})
</script>

<template>
  <div
    ref="element"
    class="pointer-events-none absolute inset-0 flex items-center justify-center text-2xl will-change-transform select-none"
  >
    {{ emoji }}
  </div>
</template>
