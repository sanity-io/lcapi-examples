import type {ClientReturn, QueryParams, SyncTag} from '@sanity/client'
import {client} from './client'

export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  lastLiveEventId,
}: {
  query: QueryString
  params?: QueryParams
  lastLiveEventId: string | null
}): Promise<{data: ClientReturn<QueryString, unknown>; tags?: SyncTag[]}> {
  // The Nuxt context does not survive the await below, so grab it first.
  const nuxtApp = import.meta.server ? tryUseNuxtApp() : undefined

  const {result, syncTags} = await client.fetch(query, params, {
    lastLiveEventId,
    filterResponse: false,
  })

  if (nuxtApp && syncTags) nuxtApp.runWithContext(() => tagResponse(syncTags))

  return {data: result, tags: syncTags}
}

/**
 * Tags the SSR response so the Vercel CDN can purge it by sync tag, and lets the
 * CDN keep it only where the studio's invalidate function will purge it. Nitro ISR
 * is not used: it is keyed by path and bypass token, not by tag, and prerender
 * functions ignore the `?lastLiveEventId` query this page depends on.
 */
function tagResponse(syncTags: SyncTag[]) {
  const cacheTag = useResponseHeader('Vercel-Cache-Tag')
  const tags = new Set(
    String(cacheTag.value ?? '')
      .split(',')
      .filter(Boolean),
  )
  for (const syncTag of syncTags) tags.add(sanityCacheTag(syncTag))
  cacheTag.value = [...tags].join(',')

  if (useRuntimeConfig().public.sanity.invalidatedByFunction) {
    useResponseHeader('Vercel-CDN-Cache-Control').value = 'public, s-maxage=31536000'
    useResponseHeader('Cache-Control').value = 'public, max-age=0, must-revalidate'
  }
}
