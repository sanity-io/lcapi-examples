<script lang="ts">
  import {CorsOriginError} from '@sanity/client'
  import {goto} from '$app/navigation'
  import {onDestroy, onMount} from 'svelte'
  import {client} from './client'

  let subscription: ReturnType<ReturnType<typeof client.live.events>['subscribe']> | null = null

  onMount(() => {
    subscription = client.live.events().subscribe({
      next: (event) => {
        const url = new URL(window.location.href)

        if (event.type === 'welcome') {
          console.info('Sanity is live with automatic revalidation of published content')
          if (!url.searchParams.has('lastLiveEventId')) {
            url.searchParams.set(
              'lastLiveEventId',
              // @ts-expect-error - @TODO upgrade `@sanity/client` with the id of welcome events
              event.id,
            )
            goto(url.toString(), {replaceState: true})
          }
        } else if (event.type === 'message') {
          // @TODO add tags matching here, somehow
          // Check if the event tags intersect with our component tags
          // if (event.tags?.some((tag) => tags.includes(tag))) {
          url.searchParams.set('lastLiveEventId', event.id)
          goto(url.toString(), {replaceState: true})
          // }
        } else if (event.type === 'restart' || event.type === 'reconnect') {
          url.searchParams.delete('lastLiveEventId')
          goto(url.toString(), {replaceState: true})
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

  onDestroy(() => {
    if (subscription) {
      subscription.unsubscribe()
    }
  })
</script>
