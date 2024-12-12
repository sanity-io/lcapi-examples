'use server'

import type {SyncTag} from '@sanity/client'
import {revalidateTag} from 'next/cache'

export async function expireTags(tags: SyncTag[]) {
  revalidateTag('sanity:tags')
  for (const tag of tags) {
    revalidateTag(tag)
  }
  console.log(`<SanityLive /> expired tags: ${tags.join(', ')}`)
}
