import {createClient} from '@sanity/client'

export const client = createClient({
  projectId: 'hiomol4a',
  dataset: 'lcapi',
  apiVersion: '2024-09-21',
  useCdn: false,
})
