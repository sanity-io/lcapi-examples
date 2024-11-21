import type {LiveEventMessage, LiveEventRestart, LiveEventWelcome} from '@sanity/client'
import {CorsOriginError} from '@sanity/client'
import {useNavigate, useRouter, useRouterState, useSearch} from '@tanstack/react-router'
import {useEffect} from 'react'
import {useEffectEvent} from 'use-effect-event'
import {client} from '../utils/sanity'

export function SanityLive() {
  const selected = useRouterState({select: (state) => state.matches})
  const lastLiveEventId = useSearch({from: '__root__', select: (state) => state.lastLiveEventId})
  const navigate = useNavigate({from: '/'})
  const allTags = selected.flatMap((match) => {
    if (
      typeof match.loaderData === 'object' &&
      match.loaderData !== null &&
      'tags' in match.loaderData
    ) {
      return match.loaderData.tags
    }
    return []
  })

  const router = useRouter()
  const handleLiveEvent = useEffectEvent(
    (event: LiveEventMessage | LiveEventRestart | LiveEventWelcome) => {
      if (event.type === 'welcome') {
        console.info('Sanity is live with automatic invalidation of published content')
      } else if (event.type === 'message') {
        if (event.tags.some((tag) => allTags.includes(tag))) {
          navigate({search: (prev) => ({...prev, lastLiveEventId: event.id}), replace: true})
        } else {
          console.log('no match', event.tags, {allTags})
        }
      } else if (event.type === 'restart') {
        if (lastLiveEventId) {
          navigate({search: (prev) => ({...prev, lastLiveEventId: undefined}), replace: true})
        } else {
          router.invalidate()
        }
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

  return null
}
