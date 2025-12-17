'use client'

import {client} from '@/sanity/client'
import type {LiveEvent} from '@sanity/client'
import {CorsOriginError} from '@sanity/client'
import {useRouter} from 'next/navigation'
import {useEffect, useEffectEvent, useRef} from 'react'

export function SanityLive() {
  const router = useRouter()
  const refreshRef = useRef(0)
  const handleLiveEvent = useEffectEvent((event: LiveEvent, signal: AbortSignal) => {
    if (event.type === 'welcome') {
      console.info('Sanity is live with automatic refresh of published content')
    } else if (event.type === 'message') {
      console.log(
        '<SanityLive> schedule refresh, giving the server a change to delete from the cache',
      )
      clearTimeout(refreshRef.current)
      refreshRef.current = window.setTimeout(() => {
        if (signal.aborted) return
        console.log('<SanityLive> refreshing')
        router.refresh()
        console.log(
          '<SanityLive> schedule second refresh, in case a stale response was served while a background revalidation was in progress',
        )
        refreshRef.current = window.setTimeout(() => {
          console.log('<SanityLive> refreshing for a second time')
          router.refresh()
          console.log('<SanityLive> schedule third refresh, just to be sure')
          refreshRef.current = window.setTimeout(() => {
            console.log('<SanityLive> refreshing for a third time')
            router.refresh()
          }, 4_000)
        }, 2_000)
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
