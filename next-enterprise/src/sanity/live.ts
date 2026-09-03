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
 * With `waitFor="function"`, `<SanityLive>` holds events until the `cache-invalidate` Sanity
 * Function has revalidated tags, and then only refreshes the browser instead of revalidating here.
 * That is correct only for deployments in the function's `REVALIDATE_URLS`. Production is on that
 * list. Set `SANITY_CACHE_INVALIDATE_FUNCTION` to opt in another deployment after adding its URL.
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
