import {createClient} from '@sanity/client'

// Shared by `<SanityLive requestTag />` and `client.live.events({tag})` so the browser reuses one EventSource
export const requestTag = 'next-16'

export const client = createClient({
  projectId: 'hiomol4a',
  dataset: 'lcapi',
  apiVersion: '2026-05-28',
  useCdn: true,
  perspective: 'published',
})
