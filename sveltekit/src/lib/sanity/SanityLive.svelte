<script lang="ts">
  import {CorsOriginError, type LiveEvent} from '@sanity/client'
  import {goto, invalidateAll} from '$app/navigation'
  import {onMount} from 'svelte'
  import {client} from './client'

  let {waitFor}: {waitFor: 'function' | undefined} = $props()

  function refresh(lastLiveEventId: string | null) {
    if (waitFor === 'function') return invalidateAll()

    const url = new URL(window.location.href)
    if (lastLiveEventId) {
      url.searchParams.set('lastLiveEventId', lastLiveEventId)
    } else {
      url.searchParams.delete('lastLiveEventId')
    }
    // eslint-disable-next-line svelte/no-navigation-without-resolve
    return goto(url, {replaceState: true})
  }

  function handleLiveEvent(event: LiveEvent) {
    switch (event.type) {
      case 'welcome':
        console.info(
          waitFor === 'function'
            ? 'Sanity is live, events are released once the sync-tag invalidate function has expired the cache'
            : 'Sanity is live with automatic revalidation of published content',
        )
        if (
          waitFor !== 'function' &&
          !new URL(window.location.href).searchParams.has('lastLiveEventId')
        ) {
          // @ts-expect-error - @TODO upgrade `@sanity/client` with the id of welcome events
          refresh(event.id)
        }
        break
      case 'message':
        refresh(event.id)
        break
      case 'restart':
      case 'reconnect':
        refresh(null)
        break
      case 'goaway':
        console.warn(
          `Sanity Live connection closed, automatic revalidation is disabled: ${event.reason}`,
        )
        break
      default:
        event satisfies never
    }
  }

  onMount(() => {
    const subscription = client.live.events({waitFor}).subscribe({
      next: handleLiveEvent,
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
    return () => subscription.unsubscribe()
  })
</script>
