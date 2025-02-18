import {type ClientReturn, type QueryParams} from '@sanity/client'
import {unstable_cacheTag as cacheTag} from 'next/cache'
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
  'use cache'

  const {result, syncTags} = await client.fetch(query, params, {
    filterResponse: false,
    cacheMode: 'noStale',
  })
  const cacheTags = [...(syncTags || []), ...tags]
  /**
   * The tags used here, are expired later on in the `expireTags` Server Action with the `expireTag` function from `next/cache`
   */
  cacheTag(...cacheTags)

  return {data: result, tags: cacheTags}
}
