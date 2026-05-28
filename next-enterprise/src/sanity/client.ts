import {createClient} from '@sanity/client'

export const client = createClient({
  projectId: 'hiomol4a',
  dataset: 'lcapi',
  apiVersion: '2026-06-28',
  useCdn: true,
  perspective: 'published',
})
