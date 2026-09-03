import {syncTagInvalidateEventHandler} from '@sanity/functions'

/**
 * Comma-separated `/api/revalidate-tags` endpoints to notify before the sync tags are released.
 * Configure the deployed function with
 * `sanity functions env add cache-invalidate REVALIDATE_URLS "<url>,<url>"`.
 * Every deployment on the list should render `<SanityLive waitFor="function">`.
 */
const REVALIDATE_URLS = (
  process.env.REVALIDATE_URLS ||
  'https://lcapi-examples-next-enterprise.sanity.dev/api/revalidate-tags'
)
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean)

export const handler = syncTagInvalidateEventHandler(async ({event, done}) => {
  const {syncTags} = event.data

  await Promise.all(
    REVALIDATE_URLS.map(async (url) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({tags: syncTags}),
      })
      console.log(`Revalidated ${syncTags.length} tags at ${url}, HTTP ${res.status}`)
    }),
  )

  const response = await done(syncTags)
  console.log('Invalidation complete, Sanity responded with HTTP', response.status)
})
