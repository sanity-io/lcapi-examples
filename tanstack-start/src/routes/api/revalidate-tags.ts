import {expireSyncTags} from '@/utils/sanity.server'
import {createFileRoute} from '@tanstack/react-router'
import {z} from 'zod'

/**
 * Called by the `cache-invalidate` Sanity Function in `studio/functions` with the sync tags that
 * changed. Purges every Vercel CDN entry tagged with them so the next request reaches the origin.
 *
 * When `SANITY_REVALIDATE_SECRET` is set the function must send it as a bearer token. Without it
 * the endpoint is open, which is fine for this demo but not for a real deployment.
 */
const Body = z.object({tags: z.array(z.string()).min(1)})

export const Route = createFileRoute('/api/revalidate-tags')({
  server: {
    handlers: {
      POST: async ({request}) => {
        const secret = process.env.SANITY_REVALIDATE_SECRET
        if (secret && request.headers.get('authorization') !== `Bearer ${secret}`) {
          return new Response('Unauthorized', {status: 401})
        }

        const body = Body.safeParse(await request.json().catch(() => undefined))
        if (!body.success) {
          return Response.json({error: 'Expected a JSON body of {tags: string[]}'}, {status: 400})
        }

        await expireSyncTags(body.data.tags)
        return Response.json({revalidated: body.data.tags})
      },
    },
  },
})
