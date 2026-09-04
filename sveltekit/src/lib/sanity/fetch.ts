import {type ClientReturn, type QueryParams, type SyncTag} from '@sanity/client'
import {dangerouslyDeleteByTag, getCache} from '@vercel/functions'
import {getRequestEvent} from '$app/server'
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

  const {locals} = getRequestEvent()
  const key = JSON.stringify([query, params])
  const cached = (await cache.get(key)) as SanityFetchResult<QueryString> | null
  const fresh = cached ?? (await fetchAndCache(query, params, key))
  for (const tag of fresh.tags) locals.cacheTags.add(cacheTag(tag))
  return fresh
}

async function fetchAndCache<const QueryString extends string>(
  query: QueryString,
  params: QueryParams,
  key: string,
): Promise<SanityFetchResult<QueryString>> {
  const {result, syncTags = []} = await client.fetch(query, params, {
    cacheMode: 'noStale',
    filterResponse: false,
  })
  const fresh = {data: result, tags: syncTags}
  await cache.set(key, fresh, {tags: syncTags.map(cacheTag)})
  return fresh
}

/**
 * `dangerouslyDeleteByTag` drops the tagged CDN, runtime, and data cache entries so the next request
 * reaches origin. `invalidateByTag` would serve one stale response first, and that response is the
 * one the browser fetches right after a live event. Off Vercel the platform purge is a no-op, so the
 * runtime cache is expired directly as well to keep local development working.
 */
export async function expireTags(tags: string[]): Promise<void> {
  const cacheTags = tags.map(cacheTag)
  if (!env.VERCEL) console.info('Skipped the Vercel CDN purge outside Vercel for', cacheTags)
  await Promise.all([dangerouslyDeleteByTag(cacheTags), cache.expireTag(cacheTags)])
}
