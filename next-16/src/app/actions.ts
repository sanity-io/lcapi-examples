'use server'

import {parseTags} from 'next-sanity/live'
import {updateTag} from 'next/cache'

export async function updateTags(unsafeTags: unknown) {
  const {tags} = parseTags(unsafeTags)
  for (const tag of tags) {
    updateTag(tag)
  }
  console.log(`<SanityLive /> updated tags: ${tags.join(', ')}`)
}

export async function randomColorTheme(background: string, text: string) {
  const formData = new FormData()
  formData.append('background', background)
  formData.append('text', text)
  await fetch('https://lcapi-examples-api.sanity.dev/api/random-color-theme', {
    method: 'PUT',
    body: formData,
  })
  updateTag('theme')
}
