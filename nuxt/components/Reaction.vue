<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { client } from '../utils/sanity/client'
import { defineQuery } from 'groq'
import type { ClientReturn, SyncTag } from '@sanity/client'

const props = defineProps<{ _ref: string }>()

const REACTION_QUERY = defineQuery(`*[_type == "reaction" && _id == $id][0]{emoji,reactions}`)

const data = ref<ClientReturn<typeof REACTION_QUERY> | null>(null)
const lastLiveEventId = ref<string | null>(null)
const syncTags = ref<SyncTag[]>()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let subscription: any = null

onMounted(() => {
  subscription = client.live.events().subscribe((event) => {
    if (
      event.type === 'message' &&
      Array.isArray(syncTags.value) &&
      event.tags.some((tag) => syncTags.value?.includes(tag))
    ) {
      lastLiveEventId.value = event.id
    }
  })

  fetchData()
})

onUnmounted(() => {
  subscription?.unsubscribe()
})

async function fetchData() {
  try {
    const { result, syncTags: tags } = await client.fetch(
      REACTION_QUERY,
      { id: props._ref },
      { filterResponse: false, lastLiveEventId: lastLiveEventId.value }
    )
    data.value = result
    syncTags.value = tags
  } catch (error) {
    console.error(error)
  }
}

watch(() => lastLiveEventId.value, fetchData)
</script>

<template>
  <ReactionButton
    v-if="data?.emoji && typeof data.reactions === 'number'"
    :id="props._ref"
    :emoji="data.emoji"
    :reactions="data.reactions"
  />
  <ReactionFallback v-else />
</template>