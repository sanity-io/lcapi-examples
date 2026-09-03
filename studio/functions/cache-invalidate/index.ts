import {syncTagInvalidateEventHandler} from '@sanity/functions'

const REVALIDATE_URLS = [
  'https://lcapi-examples-next-enterprise.sanity.dev/api/revalidate-tags',
  'https://lcapi-examples-next-15.sanity.dev/api/revalidate-tags',
]

export const handler = syncTagInvalidateEventHandler(async ({event, done}) => {
  const {syncTags} = event.data

  // allSettled so one unreachable deployment never delays `done` for the others
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
        `Revalidated ${syncTags.length} tags on ${REVALIDATE_URLS[i]}, HTTP ${result.value.status}`,
      )
    } else {
      console.error(`Failed to revalidate tags on ${REVALIDATE_URLS[i]}`, result.reason)
    }
  })

  const response = await done(syncTags)
  console.log('Invalidation complete, Sanity responded with HTTP', response.status)
})
