import {dangerouslyDeleteByTag} from '@vercel/functions'

/**
 * Called by the Sanity Function in `studio/functions/cache-invalidate`, which
 * POSTs `{tags: string[]}` on every content change. Same contract as
 * `next-enterprise/src/app/api/revalidate-tags/route.ts`.
 *
 * SSR responses carry these tags in `Vercel-Cache-Tag` (see `sanityFetch`), so
 * deleting them here is what makes the next page load fresh. Delete rather than
 * `invalidateByTag`: invalidate serves the stale page once more while it
 * revalidates in the background, delete makes the next request a foreground
 * MISS with the new content, matching next-enterprise's `expire: 0`. Off
 * Vercel (local dev, other hosts) there is no purge API and the call resolves
 * as a no-op; there is nothing CDN-cached there either.
 *
 * Intentionally unauthenticated for the demo. In production you MUST
 * authenticate this request (shared bearer token or signed payload), or anyone
 * can force purges and degrade your origin.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{tags?: unknown}>(event)
  const tags = body?.tags

  if (!Array.isArray(tags) || tags.length === 0) {
    return Response.json({error: 'Missing tags array'}, {status: 400})
  }

  try {
    await dangerouslyDeleteByTag(tags.map(sanityCacheTag))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error('CDN purge failed', tags, message)
    return Response.json({error: message}, {status: 500})
  }

  console.info(`Purged ${tags.length} sync tags`, tags)
  return Response.json({revalidated: tags})
})
