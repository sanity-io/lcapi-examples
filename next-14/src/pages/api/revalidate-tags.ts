import {toCacheTag} from '@/sanity/revalidation'
import {invalidateByTag} from '@vercel/functions'
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

  const cacheTags = tags.map(toCacheTag)
  // The purge API reaches the CDN through the Vercel request context, which only exists on Vercel
  const onVercel = Boolean(process.env.VERCEL)
  if (onVercel) {
    await invalidateByTag(cacheTags)
    console.log(`Invalidated CDN cache tags: ${cacheTags.join(', ')}`)
  } else {
    console.log(`Not on Vercel, skipped CDN cache invalidation for: ${cacheTags.join(', ')}`)
  }

  return res.status(200).json({tags: cacheTags, purged: onVercel})
}
