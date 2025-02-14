import {defineQuery} from 'groq'

export const INDEX_QUERY = defineQuery(`{
  "theme": *[_id == "theme"][0]{background,text},
  "title": *[_type == "demo" && slug.current == $slug][0].title
}`)
