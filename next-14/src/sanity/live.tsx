import {client} from '@/sanity/client'
import type {RevalidatedBy} from '@/sanity/revalidation'
import {CorsOriginError, type LiveEvent, type SyncTag} from '@sanity/client'
import {useRouter} from 'next/router'
import {useEffect} from 'react'
import {useEffectEvent} from 'use-effect-event'

/**
 * `defineLive` from `next-sanity/live` needs Server Functions and `next/cache`, which the Pages
 * Router does not have. This component does the same job for a CDN-cached page: it listens for
 * Live Content API events and refetches the page when one of its sync tags changes.
 */
export function SanityLive(props: {tags: SyncTag[]; revalidatedBy: RevalidatedBy}) {
  const {tags, revalidatedBy} = props
  const router = useRouter()

  const refresh = useEffectEvent(async (changedTags: SyncTag[], lastLiveEventId?: string) => {
    if (revalidatedBy === 'client') {
      await fetch('/api/revalidate-tags', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({tags: changedTags}),
      })
    }
    // A purged tag leaves the CDN serving stale while it revalidates in the background. The event id
    // in the query gives this refetch its own cache key, so it reaches getServerSideProps.
    // A reconnect has no event id, so a timestamp keys that refetch instead.
    const query = {...router.query}
    delete query.lastLiveEventId
    delete query.refetchedAt
    if (lastLiveEventId) query.lastLiveEventId = lastLiveEventId
    else query.refetchedAt = Date.now().toString()
    router.replace(
      {pathname: router.pathname, query},
      undefined,
      // The client router also caches page data per URL, so skip it for a URL it has seen before
      {scroll: false, unstable_skipClientCache: true},
    )
  })

  const handleLiveEvent = useEffectEvent((event: LiveEvent) => {
    switch (event.type) {
      case 'welcome':
        console.info('Sanity is live with automatic revalidation of published content')
        break
      case 'message':
        if (event.tags.some((tag) => tags.includes(tag))) {
          refresh(event.tags, event.id)
        }
        break
      // Events may have been missed while disconnected, so treat every tag on the page as changed
      case 'restart':
        refresh(tags, event.id)
        break
      case 'reconnect':
        refresh(tags)
        break
      case 'goaway':
        break
      default: {
        const unhandled: never = event
        throw new Error(`Unhandled live event: ${JSON.stringify(unhandled)}`)
      }
    }
  })

  useEffect(() => {
    const subscription = client.live
      .events({tag: 'next-14', waitFor: revalidatedBy === 'function' ? 'function' : undefined})
      .subscribe({
        next: handleLiveEvent,
        error: (error: unknown) => {
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
  }, [revalidatedBy])

  return null
}
