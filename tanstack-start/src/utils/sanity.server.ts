import type {ClientReturn, QueryParams, SyncTag} from '@sanity/client'
import {getResponseHeader, setResponseHeader} from '@tanstack/react-start/server'
import {dangerouslyDeleteByTag} from '@vercel/functions'
import {client} from './sanity'

/**
 * Who invalidates content after Sanity publishes a change.
 *
 * - `function`: the `cache-invalidate` Sanity Function in `studio/functions` POSTs the changed
 *   sync tags to `/api/revalidate-tags`. Every response that carries Sanity data (the SSR
 *   document and server function GETs) is cached by the Vercel CDN and tagged with its sync
 *   tags, the endpoint purges those tags, and browsers wait for the function
 *   (`waitFor: 'function'`) before refetching so they never observe the CDN before the purge.
 * - `browser`: no function targets this deployment. Responses are not CDN cached and every
 *   browser refetches with `lastLiveEventId` as soon as a live event arrives.
 *
 * Production on Vercel is what the function is pointed at. Set
 * `SANITY_SYNC_TAG_INVALIDATE_FUNCTION=true` to opt another deployment in.
 */
export const invalidation: 'function' | 'browser' =
  process.env.SANITY_SYNC_TAG_INVALIDATE_FUNCTION || process.env.VERCEL_ENV === 'production'
    ? 'function'
    : 'browser'

export const waitFor = invalidation === 'function' ? 'function' : undefined

export type QueryResult<QueryString extends string> = {
  data: ClientReturn<QueryString, unknown>
  tags?: SyncTag[]
}

const cacheTag = (tag: string) => `sanity:${tag}`

/** https://vercel.com/docs/caching/cdn-cache/purge#limits */
const MAX_CDN_TAGS = 128

/**
 * Tags the current response for the Vercel CDN, merging with tags recorded earlier in the same
 * request (one SSR pass runs several `sanityFetch` calls). The purge is the real invalidation
 * path; `max-age` only bounds staleness if a callback is lost. A response with more tags than the
 * CDN can attach is left uncached rather than cached with tags that can never be purged.
 */
function tagResponse(syncTags: SyncTag[]) {
  const tags = new Set(getResponseHeader('Vercel-Cache-Tag')?.split(',').filter(Boolean))
  for (const tag of syncTags) tags.add(cacheTag(tag))
  setResponseHeader('Vercel-Cache-Tag', [...tags].join(','))
  setResponseHeader(
    'Vercel-CDN-Cache-Control',
    tags.size <= MAX_CDN_TAGS ? 'public, max-age=3600' : 'no-store',
  )
}

export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  lastLiveEventId,
}: {
  query: QueryString
  params?: QueryParams
  lastLiveEventId: string | undefined
}): Promise<QueryResult<QueryString>> {
  if (invalidation === 'browser') {
    const {result, syncTags} = await client.fetch(query, params, {
      filterResponse: false,
      lastLiveEventId,
    })
    return {data: result, tags: syncTags}
  }

  const {result, syncTags = []} = await client.fetch(query, params, {
    filterResponse: false,
    lastLiveEventId,
    cacheMode: 'noStale',
  })
  tagResponse(syncTags)
  return {data: result, tags: syncTags}
}

/**
 * Deletes instead of invalidating: `invalidateByTag` would serve the stale entry once more while
 * revalidating in the background, and that one request is exactly the browser's refetch after the
 * function completes. Purging by tag also clears the Runtime and Data caches for the same tags.
 */
export function expireSyncTags(tags: string[]): Promise<void> {
  return dangerouslyDeleteByTag(tags.map(cacheTag))
}
