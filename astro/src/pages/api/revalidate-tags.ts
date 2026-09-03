import {dangerouslyDeleteByTag} from '@vercel/functions'
import type {APIRoute} from 'astro'

/** Sync tags are short opaque ids, e.g. `s1:WHrX/A`. */
const TAG_PATTERN = /^[a-zA-Z0-9+/=._:-]{1,128}$/
const MAX_TAGS = 64

/**
 * Deletes every CDN-cached page tagged with the given sync tags. Same path and body as the
 * next-enterprise app, so `studio/functions/cache-invalidate` can POST to both.
 *
 * Deletion rather than `invalidateByTag`: invalidation serves the stale page once more while
 * revalidating in the background, and `<SanityLive>` re-renders right after this returns.
 *
 * Unauthenticated because the demo's `browser` invalidation mode calls it from the page. Outside
 * Vercel the purge is a no-op. A production app should gate this on a shared secret and only let
 * the Sanity Function call it.
 */
export const POST: APIRoute = async ({request}) => {
  const body: unknown = await request.json().catch(() => null)
  const requested =
    typeof body === 'object' && body !== null && 'tags' in body && Array.isArray(body.tags)
      ? body.tags
      : []
  const tags = requested
    .filter((tag): tag is string => typeof tag === 'string' && TAG_PATTERN.test(tag))
    .slice(0, MAX_TAGS)

  if (tags.length === 0) {
    return Response.json({error: 'Missing tags array'}, {status: 400})
  }

  await dangerouslyDeleteByTag(tags)

  return Response.json({revalidated: tags})
}
