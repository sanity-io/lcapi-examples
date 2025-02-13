import {client} from '@/sanity/client'
import {SanityLive} from '@/sanity/live'
import type {ClientReturn, SyncTag} from '@sanity/client'
import {defineQuery} from 'groq'
import type {GetServerSideProps, InferGetServerSidePropsType} from 'next'
import Head from 'next/head'
import {lazy, Suspense} from 'react'

const ThemeButton = lazy(() => import('@/components/ThemeButton'))
const TimeSince = lazy(() => import('@/components/TimeSince'))

const INDEX_QUERY = defineQuery(`{
  "theme": *[_id == "theme"][0]{background,text},
  "title": *[_type == "demo" && slug.current == $slug][0].title,
  "fetchedAt":now()
}`)
const slug = 'next-13'

export const getServerSideProps = (async ({res, query}) => {
  const {lastLiveEventId} = query
  res.setHeader(
    'Cache-Control',
    // Sets the same cache header as the Sanity API CDN, with a short lifetime if there is no lastLiveEventId param, and a much longer one if there is
    lastLiveEventId
      ? 'public, max-age=60, s-maxage=3600, stale-while-revalidate=60, stale-if-error=3600'
      : 'public, max-age=60, s-maxage=60, stale-while-revalidate=15, stale-if-error=3600',
  )
  const {result: data, syncTags: tags} = await client.fetch(
    INDEX_QUERY,
    {slug},
    {
      // Needed to access syncTags
      filterResponse: false,
      // Used for cache busting on changes
      lastLiveEventId,
    },
  )

  return {props: {data, tags}}
}) satisfies GetServerSideProps<{data: ClientReturn<typeof INDEX_QUERY>; tags?: SyncTag[]}>

export default function Home(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const {data, tags} = props
  const title = data.title || 'Next 13'

  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <main
        className="bg-theme text-theme transition-colors duration-1000 ease-in-out"
        style={{
          ['--theme-background' as string]: data.theme?.background,
          ['--theme-text' as string]: data.theme?.text,
        }}
      >
        <div className="relative flex min-h-dvh flex-col items-center justify-evenly overflow-auto">
          {data?.fetchedAt && (
            <Suspense>
              <TimeSince label="index.tsx" since={data.fetchedAt} />
            </Suspense>
          )}
          <div className="ring-theme relative mx-2 rounded-lg px-2 py-1 ring-1">
            <h1 className="min-w-64 text-balance text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:text-8xl">
              {title}
            </h1>
          </div>
          <Suspense>
            <ThemeButton />
          </Suspense>
        </div>
      </main>
      <SanityLive tags={tags} />
    </>
  )
}
