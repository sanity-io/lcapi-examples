import {type ClientReturn, type QueryParams} from '@sanity/client'
import {cacheLife, cacheTag} from 'next/cache'
import {client} from './client'

/**
 * Next v6 has a first class API in `next-sanity` that should be used instead of this function.
 * It's here to show what the fetch function would look like if you were to implement it yourself, solving for production data.
 * The `defineLive` utility in `next-sanity` handles more advanced use cases, such as live preview, integrating with `sanity/presentation`, and more.
 * @example
 * import {createClient, defineLive} from 'next-sanity/experimental/live'
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
  'use cache'
  const {result, syncTags} = await client.fetch(query, params, {
    filterResponse: false,
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

  return {data: result, tags: cacheTags}
}
