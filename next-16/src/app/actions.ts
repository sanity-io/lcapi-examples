'use server'

import type {SyncTag} from '@sanity/client'
import {updateTag} from 'next/cache'

export async function updateTags(tags: SyncTag[]) {
  for (const tag of tags) {
    updateTag(tag)
  }
  console.log(`<SanityLive /> updated tags: ${tags.join(', ')}`)
}

export async function randomColorTheme() {
  const formData = new FormData()
  formData.append('background', '#000000')
  formData.append('text', '#FFFFFF')
  const response = await fetch(
    'https://lcapi-examples-api-git-add-next-16.sanity.dev/api/random-color-theme',
    {method: 'PUT', body: formData},
  )
  if (!response.ok) {
    return null
  }
  const data = await response.json()
  if (typeof data === 'object' && 'background' in data && 'text' in data) {
    return data as {background: string; text: string}
  }
  return null
}
