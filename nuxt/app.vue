<script setup lang="ts">
import {sanityFetch} from '@/utils/sanity/fetch'
import {INDEX_QUERY} from '@/utils/sanity/queries'

const route = useRoute()

const {data: demo} = await useAsyncData(
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
  title: demo.value?.data.title || 'Nuxt',
})
</script>

<template>
  <main
    class="bg-(--theme-background) text-(--theme-text) transition-colors duration-1000 ease-in-out"
    :style="{
      '--theme-background': demo?.data.theme?.background || undefined,
      '--theme-text': demo?.data.theme?.text || undefined,
    }"
  >
    <NuxtRouteAnnouncer />
    <div class="relative flex min-h-dvh flex-col items-center justify-evenly overflow-auto">
      <h1
        class="text-balance text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:pr-8 lg:text-8xl"
      >
        {{ demo?.data.title || 'Nuxt' }}
      </h1>
      <ThemeButton />
    </div>
    <ClientOnly>
      <SanityLive :tags="demo?.tags" />
    </ClientOnly>
  </main>
</template>
