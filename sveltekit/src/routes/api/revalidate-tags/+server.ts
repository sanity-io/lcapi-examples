import {json} from '@sveltejs/kit'
import {expireTags} from '$lib/sanity/fetch'
import type {RequestHandler} from './$types'

/**
 * Receives the sync tags that changed from the studio's `cache-invalidate` Sanity Function.
 * Unauthenticated to keep the demo small. A real deployment must verify a shared secret here,
 * otherwise anyone can force cache invalidations against the origin.
 */
export const POST: RequestHandler = async ({request}) => {
  const {tags} = (await request.json()) as {tags?: unknown}

  if (!Array.isArray(tags) || tags.length === 0 || !tags.every((tag) => typeof tag === 'string')) {
    return json({error: 'Missing tags array'}, {status: 400})
  }

  await expireTags(tags)

  return json({revalidated: tags})
}
