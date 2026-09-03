import {client} from '~/utils/sanity/client'

/**
 * The one place that decides the live event stream options. `client.live.events()`
 * shares a single EventSource per distinct option set, so every subscriber must go
 * through here or the page opens a second connection.
 */
export function useSanityLiveEvents() {
  const {waitForFunction} = useRuntimeConfig().public.sanity
  return client.live.events({tag: 'nuxt', waitFor: waitForFunction ? 'function' : undefined})
}
