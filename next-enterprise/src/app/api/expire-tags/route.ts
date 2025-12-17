import {revalidateTag} from 'next/cache'

export async function POST(request: Request) {
  const url = new URL(request.url)
  const secret = url.searchParams.get('secret')
  if (secret !== process.env.SECRET) {
    return Response.json({error: 'Unauthorized'}, {status: 401})
  }

  const tags = url.searchParams.getAll('tag')
  console.log('Expiring tags from expirator service', tags)
  for (const tag of tags) {
    // A 1s expiration (instead of 0) ensures the ISR cache is updated in the background, instead of blocking the `router.refresh()` render.
    // This works since `router.refresh()` is called multiple times in a sequence to ensure distributed eventual consistency.
    revalidateTag(tag, {expire: 1})
  }
  return Response.json(tags)
}
