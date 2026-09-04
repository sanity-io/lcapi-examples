/**
 * Every Sanity-backed response carries this tag too, so `vercel cache invalidate --tag sanity`
 * purges all of them at once.
 */
export const SANITY_CACHE_TAG = 'sanity'

/**
 * Sync tags become Vercel CDN cache tags with the same `sanity:` prefix that next-sanity and the
 * next-enterprise example use, so they cannot collide with other tags in the project.
 */
export function toCacheTag(syncTag: string): string {
  return `sanity:${syncTag}`
}

export type RevalidatedBy = 'function' | 'client'

/**
 * The `cache-invalidate` Sanity Function in `studio/functions` POSTs sync tags to
 * `/api/revalidate-tags` on the deployment named in its `NEXT_14_REVALIDATE_URL` env var. There the
 * browser waits for the function before it refetches. On every other deployment the browser calls
 * the route itself.
 */
export function resolveRevalidatedBy(): RevalidatedBy {
  return process.env.SANITY_SYNC_TAG_INVALIDATE_FUNCTION || process.env.VERCEL_ENV === 'production'
    ? 'function'
    : 'client'
}
