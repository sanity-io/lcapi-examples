import {defineQuery} from 'groq'

export const INDEX_QUERY = defineQuery(`{
  "theme": *[_id == "theme"][0]{background,text},
  "demo": *[_type == "demo" && slug.current == $slug][0]{title,reactions[0..4]{_key,_ref}}
}`)
