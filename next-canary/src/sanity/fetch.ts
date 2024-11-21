import {type QueryParams} from '@sanity/client'
import {unstable_cacheTag as cacheTag} from 'next/cache'
import {client} from './client'

export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
}: {
  query: QueryString
  params?: QueryParams
}) {
  'use cache'
  const {result, syncTags} = await client.fetch(query, params, {
    filterResponse: false,
  })
  cacheTag(...(syncTags as string[]))

  return {data: result, tags: syncTags, fetchedAt: new Date().toJSON()}
}
