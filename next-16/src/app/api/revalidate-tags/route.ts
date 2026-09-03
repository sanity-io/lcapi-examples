import {revalidateTag} from 'next/cache'

/**
 * Called by the `cache-invalidate` Sanity Function in `studio/functions` with the sync tags of changed content.
 *
 * Unauthenticated so the demo needs no extra setup. In production you MUST authenticate the request,
 * for example with a shared bearer token in the `Authorization` header, or anyone can force cache invalidations.
 */
export async function POST(request: Request) {
  const {tags} = await request.json()

  if (!Array.isArray(tags) || tags.length === 0 || !tags.every(isString)) {
    return Response.json({error: 'Expected a non-empty tags array of strings'}, {status: 400})
  }

  for (const tag of tags) {
    // {expire: 0} serves fresh content on the next request instead of stale-while-revalidate
    revalidateTag(`sanity:${tag}`, {expire: 0})
  }

  return Response.json({revalidated: tags})
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}
