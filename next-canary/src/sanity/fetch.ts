import {type ClientReturn, type QueryParams} from '@sanity/client'
import {unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag} from 'next/cache'
import {client} from './client'

export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
}: {
  query: QueryString
  params?: QueryParams
}): Promise<{data: ClientReturn<QueryString, unknown>; tags?: string[]}> {
  'use cache'

  /**
   * The default cache profile isn't ideal for live content, as it has unnecessary time based background validation, as well as a too lazy client stale value
   * https://github.com/vercel/next.js/blob/8dd358002baf4244c0b2e38b5bda496daf60dacb/packages/next/cache.d.ts#L14-L26
   */
  cacheLife({
    stale: Infinity,
    revalidate: Infinity,
    expire: Infinity,
  })

  const {result, syncTags} = await client.fetch(query, params, {
    filterResponse: false,
    cacheMode: 'noStale',
  })
  /**
   * The tags used here, are expired later on in the `expireTags` Server Action with the `expireTag` function from `next/cache`
   */
  cacheTag(...(syncTags || []))

  return {data: result, tags: syncTags}
}
