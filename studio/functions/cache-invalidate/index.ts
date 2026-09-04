import {syncTagInvalidateEventHandler} from '@sanity/functions'

/**
 * Comma-separated `/api/revalidate-tags` endpoints to notify. Unset, it covers every
 * deployment that CDN-caches by sync tag and counts on this function to purge it:
 * next-enterprise and nuxt (see `invalidatedByFunction` in `nuxt/nuxt.config.ts`).
 */
const REVALIDATE_URLS = (
  process.env.REVALIDATE_URLS ??
  'https://lcapi-examples-next-enterprise.sanity.dev/api/revalidate-tags,https://lcapi-examples-nuxt.sanity.dev/api/revalidate-tags'
)
  .split(',')
  .map((url) => url.trim())
  .filter(Boolean)

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
    if (result.status === 'fulfilled') {
      console.log(
        `Revalidated ${syncTags.length} tags at ${REVALIDATE_URLS[i]}, HTTP ${result.value.status}`,
      )
    } else {
      console.error(`Failed to revalidate ${REVALIDATE_URLS[i]}:`, result.reason)
    }
  })

  const response = await done(syncTags)
  console.log('Invalidation complete, Sanity responded with HTTP', response.status)
})
