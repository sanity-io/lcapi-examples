import {type ClientReturn, type QueryParams} from '@sanity/client'
import {cacheLife, cacheTag} from 'next/cache'

import {client} from './client'

/**
 * Next v16 has a first class API in `next-sanity` that should be used instead of this function.
 * It's here to show what the fetch function would look like if you were to implement it yourself, solving for production data.
 * The `defineLive` utility in `next-sanity@^12` handles more advanced use cases, such as live preview, integrating with `sanity/presentation`, and more.
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
}): Promise<{data: ClientReturn<QueryString, unknown>; tags?: string[]; fetchedAt: string}> {
  'use cache: remote'
  const {result, syncTags} = await client.fetch(query, params, {
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
  /**
   * The tags used here, are expired later on in the `updateTags` Server Action with the `updateTag` function from `next/cache`
   */
  cacheTag(...cacheTags)
  /**
   * We use on-demand revalidation, so the cache should live for as long as possible
   */
  cacheLife({
    // The default 15 minutes are too short
    revalidate: 60 * 60 * 24 * 90,
  })

  return {data: result, tags: cacheTags, fetchedAt: new Date().toJSON()}
}
