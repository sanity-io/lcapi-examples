'use server'

import type {SyncTag} from '@sanity/client'
import {expireTag} from 'next/cache'

export async function randomColorTheme(tags: SyncTag[]) {
  const res = await fetch('https://lcapi-examples-api.sanity.dev/api/random-color-theme', {
    method: 'PUT',
  })
  expireTag(...tags)
  return res.json()
}
