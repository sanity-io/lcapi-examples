<script setup lang="ts">
import {sanityFetch} from '@/utils/sanity/fetch'
import {INDEX_QUERY} from '@/utils/sanity/queries'
import {SpeedInsights} from '@vercel/speed-insights/vue'
import Reactions from './components/Reactions.vue'


const route = useRoute()

const {data} = await useAsyncData(
  'index',
  () =>
    sanityFetch({
      query: INDEX_QUERY,
      params: {slug: 'nuxt'},
      lastLiveEventId: route.query.lastLiveEventId as string,
    }),
  {
    watch: [() => route.query.lastLiveEventId],
  },
)

useHead({
  title: data.value?.data.demo?.title || 'Nuxt',
})
</script>

<template>
  <main
    class="bg-(--theme-background) text-(--theme-text) transition-colors duration-1000 ease-in-out"
    :style="{
      '--theme-background': data?.data.theme?.background || undefined,
      '--theme-text': data?.data.theme?.text || undefined,
    }"
  >
    <NuxtRouteAnnouncer />
    <div class="relative flex min-h-dvh flex-col items-center justify-evenly overflow-auto">
      <h1
        class="text-balance text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:pr-8 lg:text-8xl"
      >
        {{ data?.data.demo?.title || 'Nuxt' }}
      </h1>
      <ThemeButton />
      <Reactions v-if="data?.data?.demo?.reactions" :data="data.data.demo.reactions" />
    </div>
    <ClientOnly>
      <SanityLive :tags="data?.tags" />
    </ClientOnly>
  </main>
  <SpeedInsights />
</template>
