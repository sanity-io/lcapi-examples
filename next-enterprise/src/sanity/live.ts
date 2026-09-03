import type {ClientReturn, QueryParams} from 'next-sanity'
import {defineLive} from 'next-sanity/live'
import {client} from './client'

// This demo is kept simpler by omitting how to integrate with live preview, which is why we're not passing any tokens here
const {sanityFetch: _sanityFetch, SanityLive} = defineLive({
  client,
  browserToken: false,
  serverToken: false,
})

export {SanityLive}

/**
 * The `cache-invalidate` Sanity Function in `studio/functions` POSTs sync tags to
 * `/api/revalidate-tags` on the deployments listed in its `REVALIDATE_URLS`, then tells the
 * Live Content API it is done. Deployments it covers pass `waitFor="function"` to `<SanityLive>`,
 * so events are held until the cache is already fresh and the browser only refreshes.
 * Other deployments (local dev, previews) are not on that list and fall back to the default
 * server action that revalidates tags on the deployment itself.
 */
export const revalidatedBySanityFunction = Boolean(
  process.env.SANITY_CACHE_INVALIDATE_FUNCTION || process.env.VERCEL_ENV === 'production',
)

/**
 * This re-export simply adds the `use cache: remote` directive to the function, and adds the `fetchedAt` debug property
 */
export async function sanityFetch<const QueryString extends string>({
  query,
  params = {},
  tags = [],
}: {
  query: QueryString
  params?: QueryParams
  tags?: string[]
}): Promise<{data: ClientReturn<QueryString, unknown>; tags?: string[]; fetchedAt: string}> {
  'use cache: remote'
  const {data, tags: cacheTags} = await _sanityFetch({query, params, tags, stega: false})

  return {data, tags: cacheTags, fetchedAt: new Date().toJSON()}
}
