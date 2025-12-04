'use server'

import type {SyncTag} from '@sanity/client'

import {revalidateTag} from 'next/cache'

export async function expireTags(tags: SyncTag[]) {
  for (const tag of tags) {
    revalidateTag(tag)
  }
  console.log(`<SanityLive /> expired tags: ${tags.join(', ')}`)
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
