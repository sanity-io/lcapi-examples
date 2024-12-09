import {createClient} from '@sanity/client'

export const client = createClient({
  projectId: '2oougytf',
  dataset: 'lcapi',
  apiVersion: '2024-09-21',
  useCdn: false,
})
