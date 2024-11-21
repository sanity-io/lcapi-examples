import {type QueryParams} from '@sanity/client'
import {client} from './client'

export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
}: {
  query: QueryString
  params?: QueryParams
}) {
  const {syncTags: tags} = await client.fetch(query, params, {
    filterResponse: false,
    returnQuery: false,
  })
  const {result, syncTags} = await client.fetch(query, params, {next: {tags}})

  return {data: result, tags: syncTags, fetchedAt: new Date().toJSON()}
}
