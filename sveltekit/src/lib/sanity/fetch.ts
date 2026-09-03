import {type ClientReturn, type QueryParams, type SyncTag} from '@sanity/client'
import {getCache} from '@vercel/functions'
import {env} from '$env/dynamic/private'
import {client} from './client'

/**
 * Production deployments, and any deployment the studio's `cache-invalidate` Sanity Function POSTs
 * to, rely on that function to expire the runtime cache. Everywhere else the browser busts the
 * Sanity CDN per live event with `lastLiveEventId` instead.
 */
export const waitFor: 'function' | undefined =
  env.SANITY_SYNC_TAG_INVALIDATE_FUNCTION || env.VERCEL_ENV === 'production'
    ? 'function'
    : undefined

const cache = getCache()

const cacheTag = (tag: string) => `sanity:${tag}`

type SanityFetchResult<QueryString extends string> = {
  data: ClientReturn<QueryString, unknown>
  tags: SyncTag[]
}

export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  lastLiveEventId,
}: {
  query: QueryString
  params?: QueryParams
  lastLiveEventId: string | null
}): Promise<SanityFetchResult<QueryString>> {
  if (waitFor !== 'function') {
    const {result, syncTags = []} = await client.fetch(query, params, {
      lastLiveEventId,
      filterResponse: false,
    })
    return {data: result, tags: syncTags}
  }

  const key = JSON.stringify([query, params])
  const cached = (await cache.get(key)) as SanityFetchResult<QueryString> | null
  if (cached) return cached

  const {result, syncTags = []} = await client.fetch(query, params, {
    cacheMode: 'noStale',
    filterResponse: false,
  })
  const fresh = {data: result, tags: syncTags}
  await cache.set(key, fresh, {tags: syncTags.map(cacheTag)})
  return fresh
}

export function expireTags(tags: string[]): Promise<void> {
  return cache.expireTag(tags.map(cacheTag))
}
