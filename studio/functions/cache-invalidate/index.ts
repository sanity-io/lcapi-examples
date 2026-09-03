import {syncTagInvalidateEventHandler} from '@sanity/functions'

/**
 * Comma separated `/api/revalidate-tags` endpoints, set with
 * `sanity functions env add cache-invalidate REVALIDATE_URLS "https://a/api/revalidate-tags,https://b/api/revalidate-tags"`
 */
const REVALIDATE_URLS = (
  process.env.REVALIDATE_URLS ??
  'https://lcapi-examples-next-enterprise.sanity.dev/api/revalidate-tags,https://lcapi-examples-next-16.sanity.dev/api/revalidate-tags'
)
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean)

export const handler = syncTagInvalidateEventHandler(async ({event, done}) => {
  const {syncTags} = event.data

  await Promise.all(
    REVALIDATE_URLS.map(async (url) => {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({tags: syncTags}),
        })
        console.log(`Sent ${syncTags.length} tags to ${url}, HTTP ${res.status}`)
      } catch (err) {
        console.error(`Failed to revalidate ${url}`, err)
      }
    }),
  )

  const response = await done(syncTags)
  console.log('Invalidation complete, Sanity responded with HTTP', response.status)
})
