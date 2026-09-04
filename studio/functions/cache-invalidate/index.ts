import {syncTagInvalidateEventHandler} from '@sanity/functions'

/**
 * Every deployment that waits for this function (`client.live.events({waitFor: 'function'})`) must
 * be listed here, otherwise its live events never resolve. Set `NEXT_14_REVALIDATE_URL` with
 * `sanity functions env add cache-invalidate NEXT_14_REVALIDATE_URL <url>` after `sanity blueprints deploy`.
 */
const REVALIDATE_URLS = [
  'https://lcapi-examples-next-enterprise.sanity.dev/api/revalidate-tags',
  process.env.NEXT_14_REVALIDATE_URL,
].filter((url): url is string => Boolean(url))

export const handler = syncTagInvalidateEventHandler(async ({event, done}) => {
  const {syncTags} = event.data

  const results = await Promise.allSettled(
    REVALIDATE_URLS.map((url) =>
      fetch(url, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({tags: syncTags}),
      }),
    ),
  )
  results.forEach((result, i) => {
    const status = result.status === 'fulfilled' ? `HTTP ${result.value.status}` : result.reason
    console.log(`Posted ${syncTags.length} tags to ${REVALIDATE_URLS[i]}, ${status}`)
  })

  const response = await done(syncTags)
  console.log('Invalidation complete, Sanity responded with HTTP', response.status)
})
