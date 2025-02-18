import {type ClientReturn, type QueryParams, type SyncTag} from '@sanity/client'
import {client} from './client'

export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  lastLiveEventId,
}: {
  query: QueryString
  params?: QueryParams
  lastLiveEventId: string | null
}): Promise<{data: ClientReturn<QueryString, unknown>; tags?: SyncTag[]}> {
  const {result, syncTags} = await client.fetch(query, params, {
    lastLiveEventId,
    filterResponse: false,
  })

  return {data: result, tags: syncTags}
}
