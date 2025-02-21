'use client'

import type {LiveEventMessage, LiveEventRestart, LiveEventWelcome} from '@sanity/client'
import {CorsOriginError} from '@sanity/client'
import {useRouter} from 'next/navigation'
import {useEffect} from 'react'
import {useEffectEvent} from 'use-effect-event'
import {client} from '../sanity/client'
import {expireTags} from './actions'

/**
 * Next v14 has a first class API in `next-sanity` that should be used instead of this function.
 * It's here to show what the fetch function would look like if you were to implement it yourself, solving for production data.
 * The `defineLive` utility in `next-sanity` handles more advanced use cases, such as live preview, integrating with `sanity/presentation`, and more.
 * @example
 * import {createClient, defineLive} from 'next-sanity'
 * export const {sanityFetch, SanityLive} = defineLive({client: createClient({projectId, dataset, ...})})
 */
export function SanityLive() {
  const router = useRouter()

  const handleLiveEvent = useEffectEvent(
    (event: LiveEventMessage | LiveEventRestart | LiveEventWelcome) => {
      if (event.type === 'welcome') {
        console.info('Sanity is live with automatic revalidation of published content')
      } else if (event.type === 'message') {
        expireTags(event.tags)
      } else if (event.type === 'restart') {
        router.refresh()
      }
    },
  )
  useEffect(() => {
    const subscription = client.live.events().subscribe({
      next: (event) => {
        if (event.type === 'message' || event.type === 'restart' || event.type === 'welcome') {
          handleLiveEvent(event)
        }
      },
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
