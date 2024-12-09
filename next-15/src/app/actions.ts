'use server'

import type {SyncTag} from '@sanity/client'
import {revalidateTag} from 'next/cache'

export async function expireTags(tags: SyncTag[], id: string) {
  for (const tag of tags) {
    revalidateTag(tag)
  }
  console.log(`<SanityLive /> expired tags ${id}: ${tags.join(', ')}`)
}
