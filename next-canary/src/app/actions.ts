'use server'

import type {SyncTag} from '@sanity/client'
import {expireTag} from 'next/cache'

export async function expireTags(id: string, tags: SyncTag[]) {
  expireTag(...tags)
  console.log(`<SanityLive /> expired tags: ${tags.join(', ')}, id: ${id}`)
}
