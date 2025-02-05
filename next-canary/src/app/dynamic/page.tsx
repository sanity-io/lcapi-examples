import {sanityFetch} from '@/sanity/fetch'
import {defineQuery} from 'groq'
import type {Metadata} from 'next'
import {Suspense} from 'react'
import {TimeSince} from '../TimeSince'
import {UserAgent} from './UserAgent'

const DYNAMIC_DEMO_QUERY = defineQuery(`*[_type == "demo" && slug.current == $slug][0]{title,"fetchedAt":now()}`)
const slug = 'next-canary'

export const experimental_ppr = true

export async function generateMetadata(): Promise<Metadata> {
  const {data} = await sanityFetch({query: DYNAMIC_DEMO_QUERY, params: {slug}})
  return {
    title: data?.title || 'Next Canary',
  }
}

export default async function Home() {
  const {data} = await sanityFetch({query: DYNAMIC_DEMO_QUERY, params: {slug}})

  return (
    <>
      <div className="ring-theme relative mx-2 rounded-lg px-2 pb-1 pt-8 ring-1">
        <h1 className="min-w-64 text-balance text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:pr-8 lg:text-8xl">
          {data?.title || 'Next Canary'}
        </h1>
        {data?.fetchedAt && <Suspense>
          <TimeSince label="page.tsx" since={data.fetchedAt} />
        </Suspense>}
      </div>
      <Suspense
        fallback={
          <div className="bg-theme-button text-theme-button absolute bottom-2 left-2 block rounded text-xs transition duration-1000 ease-in-out">
            <span className="inline-block py-1 pl-2 pr-0.5">User Agent:</span>
            <span className="bg-theme text-theme mr-0.5 inline-block rounded-r-sm px-1 py-0.5 tabular-nums transition duration-1000 ease-in-out">
              ...
            </span>
          </div>
        }
      >
        <UserAgent />
      </Suspense>
    </>
  )
}
