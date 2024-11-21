'use server'

import type {SyncTag} from '@sanity/client'
import {expireTag} from 'next/cache'

export async function expireTags(tags: SyncTag[]) {
  expireTag(...tags)
  console.log(`<SanityLive /> expired tags: ${tags.join(', ')}`)
}

export async function randomColorTheme(tags: SyncTag[]) {
  const res = await fetch('https://lcapi-examples-api.sanity.dev/api/random-color-theme', {
    method: 'PUT',
  })
  // Wait 1 second to stagger requests a little bit
  await new Promise((resolve) => setTimeout(resolve, 1_000))
  expireTag(...tags)
  return res.json()
}
