import type {ClientReturn, QueryParams, SyncTag} from '@sanity/client'
import {getCache} from '@vercel/functions'
import {client} from './sanity'

/**
 * Who invalidates content after Sanity publishes a change.
 *
 * - `function`: the `cache-invalidate` Sanity Function in `studio/functions` POSTs the changed
 *   sync tags to `/api/revalidate-tags`. Query results are cached on the server, tagged by sync
 *   tag, and browsers wait for the function (`waitFor: 'function'`) before refetching so the
 *   refetch never observes the cache before it was expired.
 * - `browser`: no function targets this deployment. Nothing is cached on the server and every
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

const cache = getCache()

const cacheTag = (tag: string) => `sanity:${tag}`

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

  const key = JSON.stringify([query, params])
  const cached = (await cache.get(key)) as QueryResult<QueryString> | null
  if (cached) return cached

  const {result, syncTags} = await client.fetch(query, params, {
    filterResponse: false,
    lastLiveEventId,
    cacheMode: 'noStale',
  })
  const fresh: QueryResult<QueryString> = {data: result, tags: syncTags}
  // The function is the real invalidation path; the TTL only bounds staleness if a callback is lost.
  await cache.set(key, fresh, {tags: syncTags?.map(cacheTag), ttl: 60 * 60})
  return fresh
}

export function expireSyncTags(tags: string[]): Promise<void> {
  return cache.expireTag(tags.map(cacheTag))
}
