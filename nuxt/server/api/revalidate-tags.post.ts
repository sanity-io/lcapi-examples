/**
 * Called by the Sanity Function in `studio/functions/cache-invalidate`, which
 * POSTs `{tags: string[]}` on every content change. Same contract as
 * `next-enterprise/src/app/api/revalidate-tags/route.ts`.
 *
 * This example has no cache of its own to invalidate. Every request is
 * server-rendered and `sanityFetch` reads straight from Sanity's API CDN,
 * busted by `lastLiveEventId`. The route acknowledges the tags so the
 * function round-trip that `waitFor: 'function'` depends on completes. A
 * deployment that adds a Nitro cache (`defineCachedFunction` or
 * `useStorage('cache')` keyed by sync tag) drops those entries here.
 *
 * Intentionally unauthenticated for the demo. In production you MUST
 * authenticate this request (shared bearer token or signed payload), or anyone
 * can force invalidations and degrade your origin.
 */
export default defineEventHandler(async (event) => {
  const body = await readBody<{tags?: unknown}>(event)
  const tags = body?.tags

  if (!Array.isArray(tags) || tags.length === 0) {
    return Response.json({error: 'Missing tags array'}, {status: 400})
  }

  console.info(`Revalidate request for ${tags.length} sync tags`, tags)
  return Response.json({revalidated: tags})
})
