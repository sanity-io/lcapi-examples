import {type ClientReturn, type QueryParams} from '@sanity/client'
import {client} from './client'

/**
 * Next v15 has a first class API in `next-sanity` that should be used instead of this function.
 * It's here to show what the fetch function would look like if you were to implement it yourself, solving for production data.
 * The `defineLive` utility in `next-sanity` handles more advanced use cases, such as live preview, integrating with `sanity/presentation`, and more.
 * @example
 * import {createClient, defineLive} from 'next-sanity'
 * export const {sanityFetch, SanityLive} = defineLive({
 *   client: createClient({projectId, dataset, ...}),
 *   fetchOptions: {
 *     revalidate: process.env.VERCEL_ENV === 'preview' ? 15 * 60 : undefined
 *   }
 * })
 */
export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
}: {
  query: QueryString
  params?: QueryParams
}): Promise<{data: ClientReturn<QueryString, unknown>; tags?: string[]}> {
  const revalidate = 15 * 60
  // We have to fetch the sync tags first (this double-fetching is required until the new `cacheTag` API, related to 'use cache', is available in a stable next.js release)
  const {syncTags} = await client.fetch(query, params, {
    filterResponse: false,
    cacheMode: 'noStale',
    tag: 'fetch-sync-tags', // The request tag makes the fetch unique, avoids deduping with the cached query that has tags
    cache: 'force-cache',
    // Since we're double-fetching, and this request doesn't have a cache tags, we set a time based revalidation to ensure there's
    // an eventual consistency guarantee for certain edge cases that wouldn't be caught be the expirator service
    next: {revalidate},
  })
  const data = await client.fetch(query, params, {
    cacheMode: 'noStale',
    cache: 'force-cache',
    // If we're not in production we can't expect the webhook to be able to expire tags, so we fallback to time based revalidation
    next: {
      revalidate: process.env.VERCEL_ENV === 'preview' ? revalidate : undefined,
      tags: syncTags,
    },
  })
  return {data, tags: syncTags}
}
