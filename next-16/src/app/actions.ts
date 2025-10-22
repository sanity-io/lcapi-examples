'use server'

import type {SyncTag} from '@sanity/client'
import {updateTag} from 'next/cache'

export async function expireTags(tags: SyncTag[]) {
  for (const tag of tags) {
    updateTag(tag)
  }
  console.log(`<SanityLive /> updated tags: ${tags.join(', ')}`)
}

export async function randomColorTheme() {
  const response = await fetch('https://lcapi-examples-api.sanity.dev/api/random-color-theme', {
    method: 'PUT',
  })
  if (!response.ok) {
    return null
  }
  const data = await response.json()
  if (typeof data === 'object' && 'background' in data && 'text' in data) {
    return data as {background: string; text: string}
  }
  return null
}
