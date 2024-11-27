'use server'

import type {SyncTag} from '@sanity/client'
import {revalidateTag} from 'next/cache'

export async function expireTags(tags: SyncTag[], id: string) {
  const resp = await fetch(`https://httpstat.us/200?id=${id}`, {
    cache: 'force-cache'
  })
  console.log(resp.url)
  console.log(resp.headers)

  for (const tag of tags) {
    revalidateTag(tag)
  }
  console.log(`<SanityLive /> expired tags: ${tags.join(', ')}`)
}
