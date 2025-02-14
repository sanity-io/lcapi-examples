<script setup lang="ts">
import {client} from '@/utils/sanity/client'
import {INDEX_QUERY} from '@/utils/sanity/queries'

const route = useRoute()
const slug = 'nuxt'
const lastLiveEventId = route.query.lastLiveEventId as string

const {data: sanityData} = await useAsyncData('index',  () => client.fetch(
    INDEX_QUERY,
    {slug},
    {
      filterResponse: false,
      lastLiveEventId: route.query.lastLiveEventId as string,
    },
  ),{
    watch: [() => route.query.lastLiveEventId]
  })

useHead({
  title: sanityData.value?.result.title || 'Nuxt',
})
</script>

<template>
  <main
    class="bg-(--theme-background) text-(--theme-text) transition-colors duration-1000 ease-in-out"
    :style="{
      '--theme-background': sanityData?.result.theme?.background || undefined,
      '--theme-text': sanityData?.result.theme?.text || undefined,
    }"
  >
    <NuxtRouteAnnouncer />
    <div class="relative flex min-h-dvh flex-col items-center justify-evenly overflow-auto">
      <h1
        class="text-balance text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:pr-8 lg:text-8xl"
      >
        {{ sanityData?.result.title || 'Nuxt' }}
      </h1>
        <ThemeButton />
    </div>
    <ClientOnly>
      <SanityLive :tags="sanityData?.syncTags"" />
    </ClientOnly>
  </main>
</template>
