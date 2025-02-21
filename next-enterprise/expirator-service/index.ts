import {createClient} from '@sanity/client'

const client = createClient({
  projectId: 'hiomol4a',
  dataset: 'lcapi',
  apiVersion: '2025-02-19',
  useCdn: false,
})

const appOrigin = 'https://lcapi-examples-next-enterprise.sanity.dev'
const appRoute = new URL('/api/expire-tags', appOrigin)
appRoute.searchParams.set('secret', process.env.SECRET!)

async function connectToSanity(retryCount = 0, maxRetries = 10) {
  const backoffDelay = Math.min(1000 * Math.pow(2, retryCount), 30000) // Exponential backoff, max 30s

  try {
    await new Promise((resolve, reject) => {
      const subscription = client.live.events().subscribe({
        next: async (event) => {
          if (event.type === 'welcome') {
            console.info(
              `Connected to the Sanity Live Content API, events will be forwarded to ${appOrigin} on a protected route which expires tag entries`,
            )
          } else if (event.type === 'message') {
            const url = new URL(appRoute)
            for (const tag of event.tags) {
              url.searchParams.append('tag', tag)
            }
            console.group('Forwarding tags to api route')
            try {
              const res = await fetch(url, {method: 'POST'})
              if (!res.ok) {
                throw new TypeError('Failed', {cause: res.statusText})
              }
              const json = await res.json()
              console.info('Forwarded', json)
            } catch (error) {
              console.error('Failed to forward tags to api route', event, error, url.toString())
            } finally {
              console.groupEnd()
            }
          } else if (event.type === 'reconnect') {
            console.warn('Connection interrupted, attempting to reconnect...', event)
            subscription.unsubscribe()
            // Start reconnection process
            setTimeout(() => {
              connectToSanity(retryCount + 1, maxRetries)
            }, backoffDelay)
          }
        },
        error: async (error) => {
          console.error('Connection error:', error)
          if (retryCount < maxRetries) {
            console.info(
              `Retrying connection in ${backoffDelay}ms (attempt ${retryCount + 1}/${maxRetries})`,
            )
            setTimeout(() => {
              connectToSanity(retryCount + 1, maxRetries)
            }, backoffDelay)
          } else {
            console.error('Max retry attempts reached, shutting down')
            process.exit(1)
          }
        },
        complete: () => {
          console.info('Connection closed')
          if (retryCount < maxRetries) {
            setTimeout(() => {
              connectToSanity(retryCount + 1, maxRetries)
            }, backoffDelay)
          }
        },
      })
    })
  } catch (error) {
    console.error('Connection attempt failed:', error)
    if (retryCount < maxRetries) {
      console.info(
        `Retrying connection in ${backoffDelay}ms (attempt ${retryCount + 1}/${maxRetries})`,
      )
      setTimeout(() => {
        connectToSanity(retryCount + 1, maxRetries)
      }, backoffDelay)
    } else {
      console.error('Max retry attempts reached, shutting down')
      process.exit(1)
    }
  }
}

// Start the connection
connectToSanity()
