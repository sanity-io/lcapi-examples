'use server'

import {refresh, updateTag} from 'next/cache'

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

export async function liveRefresh() {
  refresh()
}
