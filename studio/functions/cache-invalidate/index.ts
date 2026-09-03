import {syncTagInvalidateEventHandler} from '@sanity/functions'

/**
 * Every app that caches rendered content by sync tag and expects this function to purge it.
 * Override with a comma-separated `REVALIDATE_URLS` (`sanity functions env add`) to point at
 * other deployments. Each URL accepts `POST {tags: string[]}`.
 */
const REVALIDATE_URLS = (
  process.env.REVALIDATE_URLS ??
  [
    'https://lcapi-examples-next-enterprise.sanity.dev/api/revalidate-tags',
    'https://lcapi-examples-astro.sanity.dev/api/revalidate-tags',
  ].join(',')
).split(',')

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
  for (const [i, result] of results.entries()) {
    const status = result.status === 'fulfilled' ? `HTTP ${result.value.status}` : result.reason
    console.log(`Revalidated ${syncTags.length} tags at ${REVALIDATE_URLS[i]}, ${status}`)
  }

  // Always release the event, otherwise clients subscribed with `waitFor=function` never hear it.
  const response = await done(syncTags)
  console.log('Invalidation complete, Sanity responded with HTTP', response.status)
})
