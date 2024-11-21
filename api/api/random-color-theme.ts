/**
 * It's a bit annoying to handle tokens in 50 different apps and frameworks, so this edge API contains the logic for us in one place
 */

import {createClient} from '@sanity/client'
import {lch} from 'd3-color'
import {defineQuery} from 'groq'

export const config = {runtime: 'edge'}

const headers = new Headers({
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'OPTIONS, PUT',
  'Content-Type': 'application/json',
})

function getRandomHue() {
  // Get a cryptographically strong random number between 0-360
  const array = new Uint16Array(1)
  crypto.getRandomValues(array)
  return array[0] % 360
}

function getHarmonizingHues(baseHue: number) {
  // Return an array of harmonizing hues based on color theory
  return [
    (baseHue + 180) % 360, // Complementary
    (baseHue + 120) % 360, // Triadic 1
    (baseHue + 240) % 360, // Triadic 2
    (baseHue + 90) % 360, // Tetradic
    (baseHue + 270) % 360, // Tetradic
    (baseHue + 30) % 360, // Analogous 1
    (baseHue + 330) % 360, // Analogous 2
  ]
}

function generateThemeColors() {
  const bgHue = getRandomHue()

  // Get harmonizing hues and pick one randomly
  const harmonicHues = getHarmonizingHues(bgHue)
  const textHue =
    harmonicHues[
      Math.floor((crypto.getRandomValues(new Uint8Array(1))[0] / 256) * harmonicHues.length)
    ]

  return {
    // background: `lch(5% 25 ${bgHue})`,
    background: lch(5, 25, bgHue).formatHex(),
    // text: `lch(50% 50 ${textHue})`,
    text: lch(50, 50, textHue).formatHex(),
  }
}

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
      apiVersion: '2024-09-18',
      useCdn: false,
      token: process.env.SANITY_API_WRITE_TOKEN,
    })
    const THEME_QUERY = defineQuery(`*[_id == "theme"][0]{_rev,background,text}`)
    const prevTheme = await client.fetch(THEME_QUERY, {}, {perspective: 'published'})
    const _id = 'theme'
    const nextTheme = generateThemeColors()
    client
      .patch(_id)
      .ifRevisionId(prevTheme._rev)
      .set(
        // If the new theme is the same as the previous theme, swap the background and text colors
        prevTheme?.background === nextTheme.background && prevTheme?.text === nextTheme.text
          ? {background: nextTheme.text, text: nextTheme.background}
          : nextTheme,
      )
      .commit()

    return new Response(JSON.stringify(nextTheme), {status: 200, headers})
  } catch (err) {
    return new Response(JSON.stringify(err?.message || err?.name || 'Unknown error'), {
      status: 500,
      headers,
    })
  }
}
