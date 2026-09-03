import {defineLive} from 'next-sanity/live'
import {client} from './client'

// This demo is kept simpler by omitting how to integrate with live preview, which is why we're not passing any tokens here
export const {sanityFetch, SanityLive} = defineLive({
  client,
  browserToken: false,
  serverToken: false,
})
