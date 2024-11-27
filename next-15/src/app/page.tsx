import {sanityFetch} from '@/sanity/fetch'
import './globals.css'
import {defineQuery} from 'groq'
import type {Metadata} from 'next'

const DEMO_QUERY = defineQuery(
  `*[_type == "demo" && slug.current == $slug][0]{title}`,
)
const slug = 'next-15'

export async function generateMetadata(): Promise<Metadata> {
  const {data} = await sanityFetch({query: DEMO_QUERY, params: {slug}})
  return {
    title: data?.title || 'Next 15',
  }
}

export default async function Home() {
  const {data} = await sanityFetch({query: DEMO_QUERY, params: {slug}})

  return (
    <div className="ring-theme relative mx-2 rounded-lg px-2 pb-1 pt-8 ring-1">
      <h1 className="min-w-64 text-balance text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:pr-8 lg:text-8xl">
        {data?.title || 'Next 15'}
      </h1>
      {/* {data?.fetchedAt && (
        <Suspense>
          <TimeSince label="page.tsx" since={data.fetchedAt} />
        </Suspense>
      )} */}
    </div>
  )
}
