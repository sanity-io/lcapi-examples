import {addCacheTag} from '@vercel/functions'
import {defineLive, type DefinedSanityFetchType} from 'next-sanity/live'
import {client} from './client'

// This demo is kept simpler by omitting how to integrate with live preview, which is why we're not passing any tokens here
const {sanityFetch: _sanityFetch, SanityLive} = defineLive({
  client,
  browserToken: false,
  serverToken: false,
})

export {SanityLive}

/**
 * `sanityFetch` tags the Next.js data cache with `sanity:<syncTag>` for every document the query
 * touched. Attaching the same tags to the Vercel CDN entry lets `invalidateByTag` purge it too.
 * `addCacheTag` is a no-op outside the Vercel runtime, so `next build` and `next start` are unaffected.
 */
export const sanityFetch: DefinedSanityFetchType = async (options) => {
  const response = await _sanityFetch(options)
  await addCacheTag(response.tags)
  return response
}
