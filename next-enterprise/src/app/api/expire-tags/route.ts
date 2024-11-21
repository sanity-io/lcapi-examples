import {expireTag} from 'next/cache'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const secret = url.searchParams.get('secret')
  if (secret !== process.env.SECRET) {
    return Response.json({error: 'Unauthorized'}, {status: 401})
  }

  const tags = url.searchParams.getAll('tag')
  console.log('Expiring tags from expirator service', tags)
  expireTag(...tags)
  return Response.json({tags})
}
