/**
 * It's a bit annoying to handle tokens in 50 different apps and frameworks, so this edge API contains the logic for us in one place
 */

import {lchToHex} from 'lch-color-utils'

import {createClient} from '@sanity/client'

console.log({lchToHex, createClient})

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

  return {background: `lch(5% 25 ${bgHue})`, text: `lch(30% 50 ${textHue})`}
}

export default async function handler(req: Request) {
  return new Response(JSON.stringify(generateThemeColors()), {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, PUT',
      'Content-Type': 'application/json',
    },
  })
}
