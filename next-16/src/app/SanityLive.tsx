'use client'

import {client} from '@/sanity/client'
import type {LiveEvent} from '@sanity/client'
import {CorsOriginError} from '@sanity/client'
import {startTransition, useEffect, useEffectEvent} from 'react'
import {updateTags} from './actions'
import {useRouter} from 'next/navigation'

/**
 * Next v16 has a first class API in `next-sanity` that should be used instead of this function.
 * It's here to show what the fetch function would look like if you were to implement it yourself, solving for production data.
 * The `defineLive` utility in `next-sanity` handles more advanced use cases, such as live preview, integrating with `sanity/presentation`, and more.
 * @example
 * import {createClient, defineLive} from 'next-sanity/experimental/live'
 * export const {sanityFetch, SanityLive} = defineLive({client: createClient({projectId, dataset, ...})})
 */
export function SanityLive() {
  const router = useRouter()
  const handleLiveEvent = useEffectEvent((event: LiveEvent) => {
    switch (event.type) {
      case 'welcome':
        console.info('Sanity is live with automatic revalidation of published content')
        break
      case 'message':
        startTransition(() => updateTags(event.tags))
        break
      case 'reconnect':
      case 'restart':
        router.refresh()
        break
    }
  })
  useEffect(() => {
    const subscription = client.live.events().subscribe({
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
  }, [])

  return <RefreshOnFocus />
}
SanityLive.displayName = 'SanityLive'

const focusThrottleInterval = 5_000
function RefreshOnFocus() {
  const router = useRouter()
  useEffect(() => {
    const controller = new AbortController()
    let nextFocusRevalidatedAt = 0
    const callback = () => {
      const now = Date.now()
      if (now > nextFocusRevalidatedAt && document.visibilityState !== 'hidden') {
        router.refresh()
        nextFocusRevalidatedAt = now + focusThrottleInterval
      }
    }
    const {signal} = controller
    document.addEventListener('visibilitychange', callback, {passive: true, signal})
    window.addEventListener('focus', callback, {passive: true, signal})
    return () => controller.abort()
  }, [router])

  return null
}
RefreshOnFocus.displayName = 'RefreshOnFocus'
