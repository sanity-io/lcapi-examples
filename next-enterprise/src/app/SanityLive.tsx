'use client'

import {client} from '@/sanity/client'
import type {LiveEvent} from '@sanity/client'
import {CorsOriginError} from '@sanity/client'
import {useRouter} from 'next/navigation'
import {useEffect, useEffectEvent} from 'react'

export function SanityLive() {
  const router = useRouter()
  const handleLiveEvent = useEffectEvent((event: LiveEvent, signal: AbortSignal) => {
    if (event.type === 'welcome') {
      console.info('Sanity is live with automatic refresh of published content')
    } else if (event.type === 'message') {
      console.log('<SanityLive> refreshing')
      router.refresh()
      console.log('<SanityLive> schedule 2nd refresh')
      setTimeout(() => {
        if (signal.aborted) return
        console.log('<SanityLive> refreshing again')
        router.refresh()
      }, 1_000)
    } else if (event.type === 'restart' || event.type === 'reconnect') {
      router.refresh()
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

  return null
}
SanityLive.displayName = 'SanityLive'
