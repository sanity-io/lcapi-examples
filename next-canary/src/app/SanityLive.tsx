'use client'

import {client} from '@/sanity/client'
import type {LiveEvent} from '@sanity/client'
import {CorsOriginError} from '@sanity/client'
import {useRouter} from 'next/navigation'
import {useEffect, experimental_useEffectEvent as useEffectEvent} from 'react'
import {expireTags} from './actions'

export function SanityLive() {
  const router = useRouter()

  const handleLiveEvent = useEffectEvent((event: LiveEvent) => {
    switch (event.type) {
      case 'welcome':
        console.info('Sanity is live with automatic revalidation of published content')
        break
      case 'message':
        expireTags(event.tags)
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

  return null
}
