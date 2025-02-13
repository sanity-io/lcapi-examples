'use server'

import type {SyncTag} from '@sanity/client'
import {unstable_expireTag as expireTag} from 'next/cache'

export async function expireTags(tags: SyncTag[]) {
  expireTag(...tags)
  console.log(`<SanityLive /> expired tags: ${tags.join(', ')}`)
}

export async function randomColorTheme() {
  const response = await fetch('https://lcapi-examples-api.sanity.dev/api/random-color-theme', {
    method: 'PUT',
  })
  expireTag('theme')
  if(!response.ok) {
    return null
  }
  const data = await response.json()
  if(typeof data === 'object' && 'background' in data && 'text' in data) {
    return data as {background: string; text: string}
  }
  return null
}
