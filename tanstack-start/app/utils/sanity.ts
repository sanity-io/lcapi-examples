import {createClient, type QueryParams} from '@sanity/client'

export const client = createClient({
  projectId: 'hiomol4a',
  dataset: 'lcapi',
  apiVersion: '2024-09-18',
  useCdn: true,
})

export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  lastLiveEventId,
}: {
  query: QueryString
  params?: QueryParams
  lastLiveEventId: string | undefined
}) {
  const {result, syncTags} = await client.fetch(query, params, {
    filterResponse: false,
    lastLiveEventId,
  })

  return {data: result, tags: syncTags}
}