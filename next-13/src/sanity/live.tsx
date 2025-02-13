import {client} from '@/sanity/client'
import type {LiveEvent} from '@sanity/client'
import {CorsOriginError} from '@sanity/client'
import {useRouter} from 'next/router'
import {useEffect} from 'react'
import {useEffectEvent} from 'use-effect-event'

/**
 * Next v14 and later, on App Router, has a first class API in `next-sanity`, `defineLive`, that should be used instead of this function.
 */
export function SanityLive(props: {tags?: string[]}) {
  const router = useRouter()
  const {tags = []} = props

  const handleLiveEvent = useEffectEvent((event: LiveEvent) => {
    const {lastLiveEventId, ...queryWithoutLastLiveEventId} = router.query

    switch (event.type) {
      case 'welcome':
        console.info('Sanity is live with automatic revalidation of published content')
        router.replace(
          {
            pathname: router.pathname,
            query: {...router.query, lastLiveEventId: 
              // @ts-expect-error - @TODO upgrade `@sanity/client` with the id of welcome events
              event.id},
          },
          undefined,
          {scroll: false},
        )
        break
      case 'message':
        event.tags.some((tag) => tags.includes(tag)) &&
          router.replace(
            {
              pathname: router.pathname,
              query: {...router.query, lastLiveEventId: event.id},
            },
            undefined,
            {scroll: false},
          )
        break
      case 'reconnect':
      case 'restart':
        router.replace(
          {
            pathname: router.pathname,
            query: queryWithoutLastLiveEventId,
          },
          undefined,
          {scroll: false},
        )
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
