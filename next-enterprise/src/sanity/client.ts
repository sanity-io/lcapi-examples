import {createClient} from '@sanity/client'

export const client = createClient({
  projectId: 'sx081nge',
  dataset: 'lcapi',
  apiVersion: '2024-09-21',
  useCdn: false,
  apiHost: 'https://api.sanity.work',
})
