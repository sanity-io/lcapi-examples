'use client'

import {client} from '@/sanity/client'
import type {LiveEventMessage, LiveEventRestart, LiveEventWelcome} from '@sanity/client'
import {CorsOriginError} from '@sanity/client'
import {useRouter} from 'next/navigation'
import {useEffect} from 'react'
import {useEffectEvent} from 'use-effect-event'

export function SanityLive() {
  const router = useRouter()

  const handleLiveEvent = useEffectEvent(
    (event: LiveEventMessage | LiveEventRestart | LiveEventWelcome, signal: AbortSignal) => {
      if (event.type === 'welcome') {
        console.info('Sanity is live with automatic refresh of published content')
      } else if (event.type === 'message') {
        console.log('<SanityLive> schedule refresh')
        setTimeout(() => {
          if (signal.aborted) return
          router.refresh()
          console.log('<SanityLive> refreshing')
        }, 2_000)
      } else if (event.type === 'restart') {
        router.refresh()
      }
    },
  )
  useEffect(() => {
    let controller = new AbortController()
    const subscription = client.live.events().subscribe({
      next: (event) => {
        if (event.type === 'message' || event.type === 'restart' || event.type === 'welcome') {
          controller.abort()
          controller = new AbortController()
          handleLiveEvent(event, controller.signal)
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
    return () => {
      controller.abort()
      subscription.unsubscribe()
    }
  }, [])

  return null
}
SanityLive.displayName = 'SanityLive'
