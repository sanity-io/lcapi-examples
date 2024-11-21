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
  expireTag(...tags)
  return res.json()
}
