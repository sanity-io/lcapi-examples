import {revalidateTag} from 'next/cache'

/**
 * Previously this route was hit by a hosted "expirator" service that called it
 * with `?secret=...&tag=...` query strings. It is now invoked by the Sanity
 * Function in `studio/functions/cache-invalidate` which POSTs a JSON body of
 * sync tags. Keeping the same path makes it easier to compare the two
 * approaches in git history.
 *
 * NOTE: This endpoint is intentionally unauthenticated for the demo so the
 * Sanity Function can call it without extra setup. In a production deployment
 * you MUST authenticate the request (e.g. shared bearer token in an
 * `Authorization` header, or a signed payload) — otherwise anyone can force
 * cache invalidations and degrade your origin.
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

  for (const tag of tags) {
    revalidateTag(tag, {expire: 0})
  }

  return Response.json({revalidated: tags})
}
