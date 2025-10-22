/**
 * It's a bit annoying to handle tokens in 50 different apps and frameworks, so this edge API contains the logic for us in one place
 */

import {generateThemeColors} from '@repo/generate-theme-colors'
import {createClient} from '@sanity/client'
import {waitUntil} from '@vercel/functions'
import {defineQuery} from 'groq'

export const config = {runtime: 'edge'}

const headers = new Headers({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, PUT',
  'Content-Type': 'application/json',
})

export default async function handler(request: Request) {
  if (request.method === 'OPTIONS') {
    return new Response(JSON.stringify(null), {status: 200, headers})
  }

  if (request.method !== 'PUT') {
    return new Response(JSON.stringify('Method not allowed'), {status: 405, headers})
  }

  try {
    const client = createClient({
      projectId: 'hiomol4a',
      dataset: 'lcapi',
      apiVersion: '2025-10-21',
      useCdn: false,
      token: process.env.SANITY_API_WRITE_TOKEN,
    })

    const fallbackTheme = generateThemeColors()
    const formData = await request.formData()
    const background = formData.has('background')
      ? formData.get('background')
      : fallbackTheme.background
    const text = formData.has('text') ? formData.get('text') : fallbackTheme.text
    const nextTheme = {background, text}

    waitUntil(client.patch('theme').set(nextTheme).commit())

    return new Response(JSON.stringify(nextTheme), {status: 200, headers})
  } catch (err) {
    return new Response(JSON.stringify(err?.message || err?.name || 'Unknown error'), {
      status: 500,
      headers,
    })
  }
}
