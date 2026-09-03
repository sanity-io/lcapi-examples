import {syncTagInvalidateEventHandler} from '@sanity/functions'

interface RevalidateTarget {
  url: string
  secret?: string
}

/**
 * Every app whose server cache this function keeps in sync. Extra targets are wired through
 * function env vars (`sanity functions env add cache-invalidate <KEY> <value>`), so leaving them
 * unset changes nothing for the apps already listed.
 */
const targets: RevalidateTarget[] = [
  {url: 'https://lcapi-examples-next-enterprise.sanity.dev/api/revalidate-tags'},
  ...(process.env.TANSTACK_START_REVALIDATE_URL
    ? [
        {
          url: process.env.TANSTACK_START_REVALIDATE_URL,
          secret: process.env.TANSTACK_START_REVALIDATE_SECRET,
        },
      ]
    : []),
]

export const handler = syncTagInvalidateEventHandler(async ({event, done}) => {
  const {syncTags} = event.data

  await Promise.all(
    targets.map(async ({url, secret}) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(secret ? {Authorization: `Bearer ${secret}`} : {}),
        },
        body: JSON.stringify({tags: syncTags}),
      })
      console.log(`Revalidated ${syncTags.length} tags at ${url}, HTTP ${res.status}`)
    }),
  )

  const response = await done(syncTags)
  console.log('Invalidation complete, Sanity responded with HTTP', response.status)
})
