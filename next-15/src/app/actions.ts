'use server'

import type {SyncTag} from '@sanity/client'
import {revalidateTag} from 'next/cache'

export async function expireTags(tags: SyncTag[]) {
  for (const tag of tags) {
    revalidateTag(tag)
  }
  console.log(`<SanityLive /> expired tags: ${tags.join(', ')}`)
}

export async function randomColorTheme(tags: SyncTag[]) {
  const res = await fetch('https://lcapi-examples-api.sanity.dev/api/random-color-theme', {
    method: 'PUT',
  })
  for (const tag of tags) {
    revalidateTag(tag)
  }
  return res.json()
}
