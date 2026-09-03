import {syncTagInvalidateEventHandler} from '@sanity/functions'

const DEFAULT_REVALIDATE_URLS = [
  'https://lcapi-examples-next-enterprise.sanity.dev/api/revalidate-tags',
  'https://lcapi-examples-next-15.sanity.dev/api/revalidate-tags',
]

// Set with `sanity functions env add cache-invalidate REVALIDATE_URLS "<url>,<url>"`
function resolveRevalidateUrls(env: string | undefined): string[] {
  const urls = (env ?? '')
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean)
  return urls.length > 0 ? urls : DEFAULT_REVALIDATE_URLS
}

export const handler = syncTagInvalidateEventHandler(async ({event, done}) => {
  const {syncTags} = event.data
  const revalidateUrls = resolveRevalidateUrls(process.env.REVALIDATE_URLS)

  // allSettled so one unreachable deployment never delays `done` for the others
  const results = await Promise.allSettled(
    revalidateUrls.map((url) =>
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
        `Revalidated ${syncTags.length} tags on ${revalidateUrls[i]}, HTTP ${result.value.status}`,
      )
    } else {
      console.error(`Failed to revalidate tags on ${revalidateUrls[i]}`, result.reason)
    }
  })

  const response = await done(syncTags)
  console.log('Invalidation complete, Sanity responded with HTTP', response.status)
})
