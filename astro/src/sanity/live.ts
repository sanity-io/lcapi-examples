import {SANITY_SYNC_TAG_FUNCTION, VERCEL_ENV} from 'astro:env/server'
import {client} from './client'

/**
 * Who purges the CDN cache when content changes.
 *
 * `function`: the Sync Tag Invalidate Function in `studio/functions/cache-invalidate` POSTs the
 * changed tags to `/api/revalidate-tags`, and Sanity holds the live event back until the function
 * is done (`waitFor=function`), so the browser re-renders straight into fresh content.
 *
 * `browser`: no function is deployed for this origin, so the browser purges before re-rendering.
 * This keeps local dev and preview deployments live without any Sanity Functions setup.
 */
export type Invalidation = 'function' | 'browser'

export const invalidation: Invalidation =
  SANITY_SYNC_TAG_FUNCTION || VERCEL_ENV === 'production' ? 'function' : 'browser'

/**
 * Live events are opaque sync tag notifications, so the browser subscribes without a token.
 * Resolved through the client so it always matches its project, dataset and API version.
 */
export const LIVE_EVENTS_URL = new URL(client.getUrl(client.getDataUrl('live/events'), false))
if (invalidation === 'function') LIVE_EVENTS_URL.searchParams.set('waitFor', 'function')
