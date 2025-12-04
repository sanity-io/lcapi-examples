'use client'

import type {LiveEvent} from '@sanity/client'

import {CorsOriginError} from '@sanity/client'
import {startTransition, useEffect, useEffectEvent} from 'react'

import {client} from '@/sanity/client'

import {liveRefresh, updateTags} from './actions'

export function SanityLive() {
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
        startTransition(() => liveRefresh())
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

  return null
}
SanityLive.displayName = 'SanityLive'
