import {syncTagInvalidateEventHandler} from '@sanity/functions'

/**
 * Sanity recommends a single sync-tag invalidate function per dataset, so this one fans out to
 * every app with a revalidate endpoint. Register the SvelteKit target with
 * `sanity functions env add cache-invalidate SVELTEKIT_REVALIDATE_URL <url>/api/revalidate-tags`.
 */
const REVALIDATE_URLS = [
  'https://lcapi-examples-next-enterprise.sanity.dev/api/revalidate-tags',
  process.env.SVELTEKIT_REVALIDATE_URL,
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
    if (result.status === 'fulfilled') {
      console.log(
        `Revalidated ${syncTags.length} tags at ${REVALIDATE_URLS[i]}, HTTP ${result.value.status}`,
      )
    } else {
      console.error(`Failed to revalidate ${REVALIDATE_URLS[i]}`, result.reason)
    }
  })

  const response = await done(syncTags)
  console.log('Invalidation complete, Sanity responded with HTTP', response.status)
})
