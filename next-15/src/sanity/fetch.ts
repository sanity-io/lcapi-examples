import {type QueryParams} from '@sanity/client'
import {client} from './client'

/**
 * Next v15 has a first class API in `next-sanity` that should be used instead of this function.
 * It's here to show what the fetch function would look like if you were to implement it yourself, solving for production data.
 * The `defineLive` utility in `next-sanity` handles more advanced use cases, such as live preview, integrating with `sanity/presentation`, and more.
 * @example
 * import {createClient, defineLive} from 'next-sanity'
 * export const {sanityFetch, SanityLive} = defineLive({client: createClient({projectId, dataset, ...})})
 */
export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
}: {
  query: QueryString
  params?: QueryParams
}) {
  // We have to fetch the sync tags first (this double-fetching is required until the new `cacheTag` API, related to 'use cache', is available in a stable next.js release)
  const {syncTags: tags} = await client.fetch(query, params, {
    filterResponse: false,
    cacheMode: 'noStale',
    tag: 'fetch-sync-tags', // The request tag makes the fetch unique, avoids deduping with the cached query that has tags
    next: {revalidate: false, tags: ['sanity:tags']},
  })
  const data = await client.fetch(query, params, {
    cacheMode: 'noStale',
    next: {revalidate: false, tags},
  })
  return {data, tags}
}
