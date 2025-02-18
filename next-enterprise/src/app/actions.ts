'use server'

import {unstable_expireTag as expireTag} from 'next/cache'

export async function randomColorTheme() {
  const response = await fetch('https://lcapi-examples-api.sanity.dev/api/random-color-theme', {
    method: 'PUT',
  })
  expireTag('theme')
  if (!response.ok) {
    return null
  }
  const data = await response.json()
  if (typeof data === 'object' && 'background' in data && 'text' in data) {
    return data as {background: string; text: string}
  }
  return null
}
