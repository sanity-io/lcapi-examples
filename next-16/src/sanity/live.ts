import {updateTags} from '@/app/actions'
import type {ClientReturn, QueryParams} from 'next-sanity'
import {defineLive, type DefinedLiveProps} from 'next-sanity/live'
import {client} from './client'

// This demo is kept simpler by omitting how to integrate with live preview, which is why we're not passing any tokens here
const {sanityFetch: _sanityFetch, SanityLive} = defineLive({
  client,
  browserToken: false,
  serverToken: false,
})

export {SanityLive}

/**
 * Who revalidates cache tags after a Live Content API event.
 * On Vercel production, or when `SANITY_SYNC_TAG_INVALIDATE_FUNCTION` is set, the `cache-invalidate` Sanity Function
 * in `studio/functions` POSTs the tags to `/api/revalidate-tags`, so `<SanityLive />` only waits for it and refreshes.
 * Otherwise `<SanityLive />` revalidates through the `updateTags` server action.
 */
export const revalidation: Pick<DefinedLiveProps, 'waitFor' | 'action'> =
  process.env.SANITY_SYNC_TAG_INVALIDATE_FUNCTION || process.env.VERCEL_ENV === 'production'
    ? {waitFor: 'function'}
    : {action: updateTags}

/**
 * This re-export simply adds the `use cache: remote` directive to the function, and adds the `fetchedAt` debug property
 */
export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  tags = [],
}: {
  query: QueryString
  params?: QueryParams
  tags?: string[]
}): Promise<{data: ClientReturn<QueryString, unknown>; tags: string[]; fetchedAt: string}> {
  'use cache: remote'
  const {data, tags: cacheTags} = await _sanityFetch({query, params, tags})

  return {data, tags: cacheTags, fetchedAt: new Date().toJSON()}
}
