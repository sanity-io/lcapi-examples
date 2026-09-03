import {client} from '@/sanity/client'
import {STATIC_PAGES} from '@/sanity/revalidation'
import type {NextApiRequest, NextApiResponse} from 'next'

function parseTags(body: unknown): string[] | null {
  if (typeof body !== 'object' || body === null || !('tags' in body)) return null
  const {tags} = body
  if (!Array.isArray(tags) || !tags.every((tag) => typeof tag === 'string')) return null
  return tags
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({error: 'Method not allowed'})
  }

  const tags = parseTags(req.body)
  if (!tags?.length) {
    return res.status(400).json({error: 'Missing tags array'})
  }

  const revalidated: string[] = []
  for (const page of STATIC_PAGES) {
    const {syncTags = []} = await client.fetch(page.query, page.params, {filterResponse: false})
    if (syncTags.some((tag) => tags.includes(tag))) {
      await res.revalidate(page.path)
      revalidated.push(page.path)
    }
  }
  console.log(
    `Revalidated ${revalidated.length} of ${STATIC_PAGES.length} pages for tags: ${tags.join(', ')}`,
  )

  return res.status(200).json({revalidated})
}
