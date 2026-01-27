import {revalidateTag} from 'next/cache'

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
