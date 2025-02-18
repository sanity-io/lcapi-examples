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
    revalidateTag(tag)
  }
  // Since we over-fetch, we also have to expire the syncTags fetch
  revalidateTag('sanity:tags')
  return Response.json({tags})
}
