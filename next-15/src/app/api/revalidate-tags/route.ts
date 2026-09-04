import {invalidateByTag} from '@vercel/functions'
import {revalidateTag} from 'next/cache'

/**
 * Invoked by the Sanity Function in `studio/functions/cache-invalidate`, which POSTs a JSON
 * body of sync tags whenever published content changes. This keeps the caches fresh even when
 * no browser has `<SanityLive />` mounted. The tags are prefixed with `sanity:` to match the
 * cache tags that `sanityFetch` in `src/sanity/live.ts` applies to both caches.
 *
 * Two purges run per tag:
 * - `revalidateTag` marks the Next.js data cache and ISR pages stale.
 * - `invalidateByTag` marks Vercel CDN entries tagged via `addCacheTag` stale.
 * Both are stale-while-revalidate. `dangerouslyDeleteByTag` from `@vercel/functions` is the
 * hard-delete alternative, where the next request blocks on a fresh render instead.
 *
 * NOTE: This endpoint is intentionally unauthenticated for the demo so the
 * Sanity Function can call it without extra setup. In a production deployment
 * you MUST authenticate the request (e.g. shared bearer token in an
 * `Authorization` header, or a signed payload), otherwise anyone can force
 * cache purges and degrade your origin.
 *
 * Example:
 *   const auth = request.headers.get('authorization')
 *   if (auth !== `Bearer ${process.env.REVALIDATE_SECRET}`) {
 *     return new Response('Unauthorized', {status: 401})
 *   }
 */
export async function POST(request: Request) {
  const {tags} = (await request.json()) as {tags?: string[]}

  if (!tags?.length) {
    return Response.json({error: 'Missing tags array'}, {status: 400})
  }

  const cacheTags = tags.map((tag) => `sanity:${tag}`)
  for (const tag of cacheTags) {
    revalidateTag(tag)
  }
  await invalidateByTag(cacheTags)

  return Response.json({revalidated: cacheTags})
}
