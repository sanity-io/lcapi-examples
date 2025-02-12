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
  // Uncached query that fetches cache tags (on Next 15 uncached doesn't mean on every browser request, but on every ISR build)
  const {syncTags: tags} = await client.fetch(query, params, {
    filterResponse: false,
    cacheMode: 'noStale',
    tag: 'fetch-sync-tags', // The request tag makes the fetch unique, avoids deduping with the cached query that has tags
    next: {revalidate: false, tags: ['sanity:tags']}, // Ensure we don't opt out of ISR caching
  })
  const data = await client.fetch(query, params, {
    cacheMode: 'noStale',
    next: {revalidate: false, tags},
  })
  return {data, tags}
}
