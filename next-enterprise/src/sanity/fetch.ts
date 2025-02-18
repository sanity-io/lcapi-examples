import {type ClientReturn, type QueryParams} from '@sanity/client'
import {client} from './client'

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
    filterResponse: false,
    cacheMode: 'noStale',
    tag: 'fetch-sync-tags', // The request tag makes the fetch unique, avoids deduping with the cached query that has tags
    next: {revalidate: false, tags: ['sanity:tags', ...tags]},
  })
  const cacheTags = [...(syncTags || []), ...tags]
  const data = await client.fetch(query, params, {
    cacheMode: 'noStale',
    next: {revalidate: false, tags: cacheTags},
  })
  return {data, tags: cacheTags}
}
