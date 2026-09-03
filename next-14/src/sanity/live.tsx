import {client} from '@/sanity/client'
import type {RevalidatedBy} from '@/sanity/revalidation'
import {CorsOriginError, type LiveEvent, type SyncTag} from '@sanity/client'
import {useRouter} from 'next/router'
import {useEffect} from 'react'
import {useEffectEvent} from 'use-effect-event'

/**
 * `defineLive` from `next-sanity/live` needs Server Functions and `next/cache`, which the Pages
 * Router does not have. This component does the same job for an ISR page: it listens for Live
 * Content API events and refetches the page when one of its sync tags changes.
 */
export function SanityLive(props: {tags: SyncTag[]; revalidatedBy: RevalidatedBy}) {
  const {tags, revalidatedBy} = props
  const router = useRouter()

  const refresh = useEffectEvent(async (changedTags: SyncTag[]) => {
    if (revalidatedBy === 'client') {
      await fetch('/api/revalidate-tags', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({tags: changedTags}),
      })
    }
    // The client router caches getStaticProps JSON per URL, so a plain replace would reuse the stale copy
    router.replace(router.asPath, undefined, {scroll: false, unstable_skipClientCache: true})
  })

  const handleLiveEvent = useEffectEvent((event: LiveEvent) => {
    switch (event.type) {
      case 'welcome':
        console.info('Sanity is live with automatic revalidation of published content')
        break
      case 'message':
        if (event.tags.some((tag) => tags.includes(tag))) {
          refresh(event.tags)
        }
        break
      case 'restart':
      case 'reconnect':
        // Events may have been missed while disconnected, so treat every tag on the page as changed
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
