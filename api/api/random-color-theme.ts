/**
 * It's a bit annoying to handle tokens in 50 different apps and frameworks, so this edge API contains the logic for us in one place
 */

import {lchToHex} from 'lch-color-utils'

import {createClient} from '@sanity/client'

export const config = {
  runtime: 'edge',
}

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
    background2: lchToHex({l: 5, c: 25, h: bgHue, isPrecise: true, forceinGamut: true}),
    background: `lch(5% 25 ${bgHue})`,
    text2: lchToHex({l: 30, c: 50, h: textHue, isPrecise: true, forceinGamut: true}),
    text: `lch(30% 50 ${textHue})`,
  }
}

export default async function handler(req: Request) {
  const client = createClient({
    projectId: 'hiomol4a',
    dataset: 'lcapi',
    apiVersion: '2024-09-18',
    useCdn: false,
    token: process.env.SANITY_API_WRITE_TOKEN,
  })
  const _id = 'theme'
  const patch = client.patch(_id).set(generateThemeColors())
  await client.transaction().createIfNotExists({_id, _type: _id}).patch(patch).commit()

  return new Response(JSON.stringify(patch), {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, PUT',
      'Content-Type': 'application/json',
    },
  })
}
