import type {ClientReturn} from '@sanity/client'
import type {LiveLoader} from 'astro/loaders'
import {client} from './client'

class SanityLoaderError extends Error {
  override name = 'SanityLoaderError'
}

/**
 * Live loader for a single Sanity document per entry: `getLiveEntry(collection, id)` runs
 * `query` with `$id` bound to the entry id. The Content Lake sync tags of the query become the
 * entry's cache hint, which pages forward to `Astro.cache.set()` and to `<SanityLive>`.
 */
export function sanityDocument<const Query extends string>(query: Query) {
  type Data = NonNullable<ClientReturn<Query>>

  const loader: LiveLoader<Data, never, never, SanityLoaderError> = {
    name: 'sanity-document',
    async loadEntry({filter: {id}}) {
      try {
        const {result, syncTags = []} = await client.fetch(
          query,
          {id},
          // The CDN response cache is only ever purged by sync tag, so a stale-while-revalidate
          // read here could get pinned until the next publish. `noStale` makes Sanity's CDN
          // revalidate synchronously right after content changes.
          {filterResponse: false, cacheMode: 'noStale'},
        )
        if (result === null) return undefined
        return {id, data: result, cacheHint: {tags: syncTags}}
      } catch (cause) {
        return {error: new SanityLoaderError(`Failed to load "${id}" from Sanity`, {cause})}
      }
    },
    async loadCollection() {
      return {error: new SanityLoaderError('Load documents one at a time with getLiveEntry()')}
    },
  }

  return loader
}
