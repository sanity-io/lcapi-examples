import type {Handle} from '@sveltejs/kit'

/**
 * `sanityFetch` records the `sanity:<syncTag>` tags it served during the request. Tagging the HTML
 * and `__data.json` responses with them lets the Vercel CDN hold both until
 * `/api/revalidate-tags` purges the tags, the same way the runtime cache entries are held.
 */
export const handle: Handle = async ({event, resolve}) => {
  event.locals.cacheTags = new Set()

  const response = await resolve(event)

  if (event.locals.cacheTags.size > 0) {
    response.headers.set('Vercel-Cache-Tag', [...event.locals.cacheTags].join(','))
    response.headers.set('Vercel-CDN-Cache-Control', 'public, max-age=31536000')
    response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate')
  }

  return response
}
