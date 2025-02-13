/**
 * It's a bit annoying to handle tokens in 50 different apps and frameworks, so this edge API contains the logic for us in one place
 */

import {createClient} from '@sanity/client'
import {defineQuery} from 'groq'

export const config = {runtime: 'edge'}

const headers = new Headers({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, POST',
  'Content-Type': 'application/json',
})

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(JSON.stringify(null), {status: 200, headers})
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify('Method not allowed'), {status: 405, headers})
  }

  const formData = await request.formData()
  if (!formData.has('id')) {
    return new Response(JSON.stringify('Missing required parameter: id'), {status: 400, headers})
  }

  try {
    const client = createClient({
      projectId: 'hiomol4a',
      dataset: 'lcapi',
      apiVersion: '2024-09-18',
      useCdn: false,
      token: process.env.SANITY_API_WRITE_TOKEN,
    })
    const REACTION_QUERY = defineQuery(`*[_type == "reaction" && _id == $id][0]._id`)
    const id = await client.fetch(
      REACTION_QUERY,
      {id: formData.get('id')},
      {perspective: 'published'},
    )
    if (!id) {
      return new Response(JSON.stringify('Reaction not found'), {status: 404, headers})
    }

    await client.patch(id).inc({reactions: 1}).commit()

    return new Response(JSON.stringify('Success'), {status: 200, headers})
  } catch (err) {
    return new Response(JSON.stringify(err?.message || err?.name || 'Unknown error'), {
      status: 500,
      headers,
    })
  }
}
