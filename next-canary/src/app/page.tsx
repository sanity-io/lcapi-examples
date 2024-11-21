import {sanityFetch} from '@/sanity/fetch'
import './globals.css'
import {defineQuery} from 'groq'
import type {Metadata} from 'next'

const DEMO_QUERY = defineQuery(`*[_type == "demo" && slug.current == $slug][0].title`)
const slug = 'next-canary'

export async function generateMetadata(): Promise<Metadata> {
  const {data} = await sanityFetch({query: DEMO_QUERY, params: {slug}})
  return {
    title: data || 'Next Canary',
  }
}

export default async function Home() {
  const {data} = await sanityFetch({query: DEMO_QUERY, params: {slug}})

  return (
    <h1 className="text-balance text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:pr-8 lg:text-8xl">
      {data || 'Next Canary'}
    </h1>
  )
}
