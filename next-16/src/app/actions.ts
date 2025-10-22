'use server'

import type {SyncTag} from '@sanity/client'
import {refresh, revalidateTag, updateTag} from 'next/cache'

export async function updateTags(tags: SyncTag[]) {
  for (const tag of tags) {
    updateTag(tag)
  }
  console.log(`<SanityLive /> updated tags: ${tags.join(', ')}`)
}

export async function randomColorTheme(background: string, text: string) {
  console.log('randomColorTheme', {background, text})
  const formData = new FormData()
  formData.append('background', background)
  formData.append('text', text)
  await fetch('https://lcapi-examples-api-git-add-next-16.sanity.dev/api/random-color-theme', {
    method: 'PUT',
    body: formData,
  })
  await new Promise((resolve) => setTimeout(resolve, 3_000))
  updateTag('theme')
  await new Promise((resolve) => setTimeout(resolve, 3_000))
  refresh()
}
