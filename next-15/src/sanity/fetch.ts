import {type QueryParams} from '@sanity/client'
import {cdnClient} from './client'

export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
}: {
  query: QueryString
  params?: QueryParams
}) {
  // Uncached query that fetches cache tags (on Next 15 uncached doesn't mean on every browser request, but on every ISR build)
  const {syncTags: tags} = await cdnClient.fetch(query, params, {
    filterResponse: false,
    tag: 'fetch-sync-tags', // The request tag makes the fetch unique, avoids deduping with the cached query that has tags
    cacheMode: 'noStale',
    useCdn: true,
  })
  const data = await cdnClient.fetch(query, params, {useCdn: true, cacheMode: 'noStale', next: {revalidate: false, tags}})
  return {data, tags}
}
