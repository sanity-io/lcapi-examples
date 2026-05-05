import {defineLiveCollection} from 'astro:content'
import {sanityLoader} from './loaders/sanity'

const sanity = defineLiveCollection({
  loader: sanityLoader(),
})

export const collections = {sanity}
