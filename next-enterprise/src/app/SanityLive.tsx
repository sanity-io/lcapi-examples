'use client'

import {client} from '@/sanity/client'
import type {LiveEvent} from '@sanity/client'
import {CorsOriginError} from '@sanity/client'
import {startTransition, useEffect, useEffectEvent} from 'react'
import {liveRefresh} from './actions'

export function SanityLive() {
  const handleLiveEvent = useEffectEvent((event: LiveEvent, signal: AbortSignal) => {
    if (event.type === 'welcome') {
      console.info('Sanity is live with automatic refresh of published content')
    } else if (event.type === 'message') {
      console.log('<SanityLive> refreshing')
      startTransition(() => liveRefresh())
      console.log('<SanityLive> schedule 2nd refresh')
      setTimeout(() => {
        if (signal.aborted) return
        console.log('<SanityLive> refreshing again')
        startTransition(() => liveRefresh())
      }, 1_000)
    } else if (event.type === 'restart' || event.type === 'reconnect') {
      startTransition(() => liveRefresh())
    }
  })
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

  return <RefreshOnFocus />
}
SanityLive.displayName = 'SanityLive'

const focusThrottleInterval = 5_000
function RefreshOnFocus() {
  useEffect(() => {
    const controller = new AbortController()
    let nextFocusRevalidatedAt = 0
    const callback = () => {
      const now = Date.now()
      if (now > nextFocusRevalidatedAt && document.visibilityState !== 'hidden') {
        startTransition(() => liveRefresh())
        nextFocusRevalidatedAt = now + focusThrottleInterval
      }
    }
    const {signal} = controller
    document.addEventListener('visibilitychange', callback, {passive: true, signal})
    window.addEventListener('focus', callback, {passive: true, signal})
    return () => controller.abort()
  }, [])

  return null
}
RefreshOnFocus.displayName = 'RefreshOnFocus'
