<script setup lang="ts">
import {ref, watchEffect} from 'vue'

const props = defineProps<{
  id: string
  emoji: string
  reactions: number
}>()

interface Emoji {
  key: string
  stagger: boolean
  done: boolean
}

function createEmoji(stagger: boolean): Emoji {
  return {
    key: crypto.randomUUID(),
    stagger,
    done: false,
  }
}

const initialReactions = ref(props.reactions)
const emojis = ref<Emoji[]>([])
const nextReactions = computed(() => Math.max(0, props.reactions - initialReactions.value))

watchEffect(() => {
  if (nextReactions.value > emojis.value.length) {
    const needed = nextReactions.value - emojis.value.length
    const nextEmojis = [...emojis.value]
    for (let i = 0; i < needed; i++) {
      nextEmojis.push(createEmoji(true))
    }
    emojis.value = nextEmojis
  }
})

const pendingEmojis = computed(() => emojis.value.filter(({done}) => !done).slice(0, 100))
const delay = computed(() => 8_000 / pendingEmojis.value.length)

async function handleClick() {
  emojis.value = [...emojis.value, createEmoji(false)]
  const formData = new FormData()
  formData.append('id', props.id)
  await fetch('https://lcapi-examples-api.sanity.dev/api/react', {
    method: 'POST',
    body: formData,
  })
}
</script>

<template>
  <div
    class="bg-(--theme-text)/40 focus-within:ring-(--theme-text) focus-within:ring-offset-(--theme-background) relative aspect-square rounded-lg transition duration-1000 ease-in-out focus-within:ring-2 focus-within:ring-offset-2 focus-within:duration-0"
  >
    <button
      class="flex transform-gpu cursor-pointer select-none items-center justify-center text-2xl subpixel-antialiased will-change-transform focus:outline-none"
      @click="handleClick"
    >
      <Square>{{ emoji }}</Square>
    </button>
    <TransitionGroup>
      <FloatingEmoji
        v-for="({key, stagger}, i) in pendingEmojis"
        :key="key"
        :_key="key"
        :emoji="emoji"
        :delay="stagger ? i * delay : 0"
        :emojis="emojis"
        @update:emojis="(newEmojis: Emoji[]) => (emojis = newEmojis)"
      />
    </TransitionGroup>
  </div>
</template>
