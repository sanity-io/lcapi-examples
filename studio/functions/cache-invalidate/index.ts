import {syncTagInvalidateEventHandler} from '@sanity/functions'

const REVALIDATE_URL =
  'https://lcapi-examples-next-enterprise.sanity.dev/api/revalidate'

export const handler = syncTagInvalidateEventHandler(async ({event, done}) => {
  const {syncTags} = event.data

  const res = await fetch(REVALIDATE_URL, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({tags: syncTags}),
  })
  console.log(`Revalidated ${syncTags.length} tags, HTTP ${res.status}`)

  const response = await done(syncTags)
  console.log('Invalidation complete, Sanity responded with HTTP', response.status)
})