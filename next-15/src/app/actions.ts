'use server'

import type {SyncTag} from '@sanity/client'

import {revalidateTag} from 'next/cache'

export async function revalidateTags(tags: SyncTag[]) {
  for (const tag of tags) {
    revalidateTag(tag)
  }
  console.log(`<SanityLive /> expired tags: ${tags.join(', ')}`)
}

export async function randomColorTheme(background: string, text: string) {
  const formData = new FormData()
  formData.append('background', background)
  formData.append('text', text)
  await fetch('https://lcapi-examples-api.sanity.dev/api/random-color-theme', {
    method: 'PUT',
    body: formData,
  })
  revalidateTag('theme')
}
