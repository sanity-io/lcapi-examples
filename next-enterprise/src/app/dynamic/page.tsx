import {sanityFetch} from '@/sanity/fetch'
import {defineQuery} from 'groq'
import {Suspense} from 'react'
import {TimeSince} from '../TimeSince'
import {UserAgent} from './UserAgent'

const DYNAMIC_DEMO_QUERY = defineQuery(`*[_type == "demo" && slug.current == $slug][0]{title}`)
const slug = 'next-16'

export default function Home() {
  return (
    <>
      <div className="relative mx-2 rounded-lg px-2 pt-8 pb-1 ring-1 ring-current">
        <Suspense fallback={<Title>{'Loading...'}</Title>}>
          <CachedHome />
        </Suspense>
      </div>
      <Suspense
        fallback={
          <div className="absolute bottom-2 left-2 block rounded-sm bg-(--theme-text) text-xs text-(--theme-background) transition-colors duration-1000 ease-in-out">
            <span className="inline-block py-1 pr-0.5 pl-2">User Agent:</span>
            <span className="mr-0.5 inline-block rounded-r-sm bg-(--theme-background) px-1 py-0.5 text-(--theme-text) tabular-nums transition-colors duration-1000 ease-in-out">
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

async function CachedHome() {
  'use cache'
  const {data, fetchedAt} = await sanityFetch({query: DYNAMIC_DEMO_QUERY, params: {slug}})
  console.log('CachedHome', data, fetchedAt)

  return (
    <>
      <Title>{data?.title}</Title>
      <Suspense>
        <TimeSince label="page.tsx" since={fetchedAt} rendered={new Date().toJSON()} />
      </Suspense>
    </>
  )
}

function Title(props: {children: string | null | undefined}) {
  const title = props.children || 'Next 16'
  return (
    <>
      <title>{title}</title>
      <h1 className="min-w-64 text-4xl leading-tight font-bold tracking-tighter text-balance md:text-6xl lg:pr-8 lg:text-8xl">
        {title}
      </h1>
    </>
  )
}
