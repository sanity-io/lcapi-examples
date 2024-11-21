'use server'

export async function randomColorTheme() {
  const res = await fetch('https://lcapi-examples-api.sanity.dev/api/random-color-theme', {
    method: 'PUT',
  })
  return res.json()
}
