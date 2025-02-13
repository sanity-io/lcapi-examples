import {sanityFetch} from '$lib/sanity/fetch'
import {defineQuery} from 'groq'
import type {LayoutServerLoad} from './$types'

const LAYOUT_QUERY = defineQuery(`*[_id == "theme"][0]{background,text}`)

export const load: LayoutServerLoad = async ({url}) => {
  const {data: theme} = await sanityFetch({
    query: LAYOUT_QUERY,
    lastLiveEventId: url.searchParams.get('lastLiveEventId'),
  })
  return {theme}
}
