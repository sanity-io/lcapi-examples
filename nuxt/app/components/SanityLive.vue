<script setup lang="ts">
/* eslint-disable vue/valid-template-root */
import {CorsOriginError} from '@sanity/client'
import {useRoute, useRouter} from '#app'
import {onMounted, onUnmounted} from 'vue'
import {client} from '../utils/sanity/client'

const props = defineProps<{
  tags?: string[]
}>()

// Initialize route and router
const router = useRouter()
const route = useRoute()

let subscription: ReturnType<ReturnType<typeof client.live.events>['subscribe']> | null = null

onMounted(() => {
  subscription = client.live.events().subscribe({
    next: (event) => {
      if (event.type === 'welcome') {
        console.info('Sanity is live with automatic revalidation of published content')
        if (!route.query.lastLiveEventId) {
          router.replace({
            query: {
              ...route.query,
              lastLiveEventId:
                // @ts-expect-error - @TODO upgrade `@sanity/client` with the id of welcome events
                event.id,
            },
          })
        }
      }

      if (event.type === 'message') {
        if (event.tags.some((tag) => props.tags?.includes(tag))) {
          router.replace({query: {...route.query, lastLiveEventId: event.id}})
        }
      }

      if (event.type === 'reconnect' || event.type === 'restart') {
        const {lastLiveEventId, ...queryWithoutLastLiveEventId} = route.query
        router.replace({query: queryWithoutLastLiveEventId})
      }
    },
    error: (error) => {
      if (error instanceof CorsOriginError) {
        console.warn(
          `Sanity Live is unable to connect to the Sanity API as the current origin - ${window.origin} - is not in the list of allowed CORS origins for this Sanity Project.`,
          error.addOriginUrl && `Add it here:`,
          error.addOriginUrl?.toString(),
        )
      } else {
        console.error(error)
      }
    },
  })
})

onUnmounted(() => {
  subscription?.unsubscribe()
})
</script>

<template></template>
