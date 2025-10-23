import {type ClientReturn, type QueryParams} from '@sanity/client'
import {client} from './client'

/**
 * Next v15 has a first class API in `next-sanity` that should be used instead of this function.
 * It's here to show what the fetch function would look like if you were to implement it yourself, solving for production data.
 * The `defineLive` utility in `next-sanity@^11` handles more advanced use cases, such as live preview, integrating with `sanity/presentation`, and more.
 * * Though the implementation for Next v16 in `next-sanity@12` that uses `'use cache'` is recommended.
 * @example
 * import {createClient, defineLive} from 'next-sanity/live'
 *  export const {sanityFetch, SanityLive} = defineLive({client: createClient({projectId, dataset, ...})})
 */
export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  tags = [],
}: {
  query: QueryString
  params?: QueryParams
  tags?: string[]
}): Promise<{data: ClientReturn<QueryString, unknown>; tags?: string[]}> {
  // We have to fetch the sync tags first (this double-fetching is required until the new `cacheTag` API, related to 'use cache', is available in a stable next.js release)
  const {syncTags} = await client.fetch(query, params, {
    tag: 'fetch-sync-tags', // The request tag makes the fetch unique, avoids deduping with the cached query that has tags
    /**
     * The default value is `filterResponse: true`, which is equivalent to `client.fetch(query, params, {filterResponse: false}).then(response => response.result)`,
     * and we would not be able to access `response.syncTags`.
     */
    filterResponse: false,
    /**
     * For optimal performance we want to use the API CDN and `perspective: 'published'`.
     * The special `cacheMode: 'noStale'` flag instructs the Sanity API CDN to not serve stale content while the cache is background revalidating.
     * Instead it'll wait for the background revalidation to complete, and then serve the updated content.
     */
    useCdn: true,
    perspective: 'published',
    cacheMode: 'noStale',
  })
  const cacheTags = [...(syncTags || []), ...tags]
  const data = await client.fetch(query, params, {
    cache: 'force-cache',
    next: {tags: cacheTags},
    /**
     * For optimal performance we want to use the API CDN and `perspective: 'published'`.
     * The special `cacheMode: 'noStale'` flag instructs the Sanity API CDN to not serve stale content while the cache is background revalidating.
     * Instead it'll wait for the background revalidation to complete, and then serve the updated content.
     */
    useCdn: true,
    perspective: 'published',
    cacheMode: 'noStale',
  })
  return {data, tags: cacheTags}
}
