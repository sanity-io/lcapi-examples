import {sanityFetch} from '$lib/sanity/fetch'
import {defineQuery} from 'groq'
import type {PageServerLoad} from './$types'

const INDEX_QUERY = defineQuery(`*[_type == "demo" && slug.current == $slug][0].title`)
const slug = 'sveltekit'

export const load: PageServerLoad = async ({url}) => {
  const {data: page} = await sanityFetch({
    query: INDEX_QUERY,
    params: {slug},
    lastLiveEventId: url.searchParams.get('lastLiveEventId'),
  })
  return {page}
}
