import {defineQuery} from 'groq'

const INDEX_QUERY = defineQuery(`{
  "theme": *[_id == "theme"][0]{background,text},
  "demo": *[_type == "demo" && slug.current == $slug][0]{title,reactions[0..4]{_key,_ref}}
}`)

export const INDEX_PAGE = {path: '/', query: INDEX_QUERY, params: {slug: 'next-14'}} as const

/**
 * The Pages Router revalidates by path, not by tag. The `/api/revalidate-tags` route fetches each
 * page's query for its current sync tags and regenerates the page when an invalidation event
 * overlaps them. Every ISR page that renders Sanity content belongs in this list.
 */
export const STATIC_PAGES = [INDEX_PAGE]

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
