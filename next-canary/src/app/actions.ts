'use server'

import type {SyncTag} from '@sanity/client'
import {unstable_expireTag as expireTag} from 'next/cache'

export async function expireTags(tags: SyncTag[]) {
  expireTag(...tags)
  console.log(`<SanityLive /> expired tags: ${tags.join(', ')}`)
}
