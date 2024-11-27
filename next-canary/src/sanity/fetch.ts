import {type QueryParams} from '@sanity/client'
import {unstable_cacheTag as cacheTag} from 'next/cache'
import {cdnClient} from './client'

export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
}: {
  query: QueryString
  params?: QueryParams
}) {
  'use cache'
  const {result, syncTags} = await cdnClient.fetch(query, params, {
    filterResponse: false,
    cacheMode: 'noStale',
    useCdn: true,
  })
  cacheTag(...(syncTags as string[]))

  return {data: result, tags: syncTags, fetchedAt: new Date().toJSON()}
}
