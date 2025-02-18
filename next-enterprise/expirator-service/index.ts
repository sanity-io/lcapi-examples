import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'hiomol4a',
  dataset: 'lcapi',
  apiVersion: '2024-11-21',
  useCdn: false,
})

const appOrigin = 'https://lcapi-examples-next-enterprise.sanity.dev'
const appRoute = new URL('/api/expire-tags', appOrigin)
appRoute.searchParams.set('secret', process.env.SECRET!)

await new Promise((resolve, reject) => {
  client.live.events().subscribe({
    next: (event) => {
      if (event.type === 'welcome') {
        console.info(
          `Connected to the Sanity Live Content API, events will be forwarded to ${appOrigin} on a protected route which expires tag entries`,
        )
      } else if (event.type === 'message') {
        const url = new URL(appRoute)
        for (const tag of event.tags) {
          url.searchParams.append('tag', tag)
        }
        fetch(url, {method: 'POST'})
          .then((res) => {
            if (!res.ok) {
              throw new TypeError('Failed', {cause: res.statusText})
            }
            return res.json()
          })
          .then((json) => console.info('Forwarded tags to api route', event.tags, json))
          .catch((reason) =>
            console.error('Failed to forward tags to api route', event, reason, url.toString()),
          )
      } else if (event.type === 'reconnect' || event.type === 'restart') {
        console.error('No longer connected to Sanity Live', event, 'shutting down...')
        reject(new Error('No longer connected to Sanity Live', {cause: event}))
      }
    },
    error: (error: unknown) => {
      reject(error)
    },
    complete: () => resolve(undefined),
  })
})
