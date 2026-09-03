import {defineLiveCollection} from 'astro:content'
import {defineQuery} from 'groq'
import {sanityDocument} from './sanity/loader'

const THEME_QUERY = defineQuery(`*[_id == $id][0]{background,text}`)
const DEMO_QUERY = defineQuery(
  `*[_type == "demo" && slug.current == $id][0]{title,reactions[0..4]{_key,_ref}}`,
)

export const collections = {
  theme: defineLiveCollection({loader: sanityDocument(THEME_QUERY)}),
  demo: defineLiveCollection({loader: sanityDocument(DEMO_QUERY)}),
}
