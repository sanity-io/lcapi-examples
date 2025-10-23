import {sanityFetch} from '@/sanity/fetch'
import {defineQuery} from 'groq'
import {Suspense} from 'react'
import {TimeSince} from '../TimeSince'
import {UserAgent} from './UserAgent'

const DYNAMIC_DEMO_QUERY = defineQuery(
  `*[_type == "demo" && slug.current == $slug][0]{title,"fetchedAt": now()}`,
)
const slug = 'next-16'

export default function Home() {
  return (
    <>
      <div className="relative mx-2 rounded-lg px-2 pb-1 pt-8 ring-1 ring-current">
        <Suspense fallback={<Title>{'Loading...'}</Title>}>
          <CachedHome />
        </Suspense>
      </div>
      <Suspense
        fallback={
          <div className="bg-(--theme-text) text-(--theme-background) absolute bottom-2 left-2 block rounded-sm text-xs transition-colors duration-1000 ease-in-out">
            <span className="inline-block py-1 pl-2 pr-0.5">User Agent:</span>
            <span className="bg-(--theme-background) text-(--theme-text) mr-0.5 inline-block rounded-r-sm px-1 py-0.5 tabular-nums transition-colors duration-1000 ease-in-out">
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
  const {data} = await sanityFetch({query: DYNAMIC_DEMO_QUERY, params: {slug}})

  return (
    <>
      <Title>{data?.title}</Title>
      {data?.fetchedAt && (
        <Suspense>
          <TimeSince label="page.tsx" since={data.fetchedAt} />
        </Suspense>
      )}
    </>
  )
}

function Title(props: {children: string | null | undefined}) {
  const title = props.children || 'Next 16'
  return (
    <>
      <title>{title}</title>
      <h1 className="min-w-64 text-balance text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:pr-8 lg:text-8xl">
        {title}
      </h1>
    </>
  )
}
