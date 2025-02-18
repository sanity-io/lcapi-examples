import {createClient} from '@sanity/client'

export const client = createClient({
  projectId: 'hiomol4a',
  dataset: 'lcapi',
  apiVersion: '2025-02-18',
  useCdn: true,
})
