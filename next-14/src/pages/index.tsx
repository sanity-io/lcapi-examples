import {Reactions} from '@/components/Reactions'
import {client} from '@/sanity/client'
import {SanityLive} from '@/sanity/live'
import {
  resolveRevalidatedBy,
  SANITY_CACHE_TAG,
  toCacheTag,
  type RevalidatedBy,
} from '@/sanity/revalidation'
import type {ClientReturn, SyncTag} from '@sanity/client'
import {defineQuery} from 'groq'
import type {GetServerSideProps, InferGetServerSidePropsType} from 'next'
import Head from 'next/head'
import {lazy, Suspense} from 'react'

const ThemeButton = lazy(() => import('@/components/ThemeButton'))
const TimeSince = lazy(() => import('@/components/TimeSince'))

const INDEX_QUERY = defineQuery(`{
  "theme": *[_id == "theme"][0]{background,text},
  "demo": *[_type == "demo" && slug.current == $slug][0]{title,reactions[0..4]{_key,_ref}}
}`)
const slug = 'next-14'

export const getServerSideProps: GetServerSideProps<{
  data: ClientReturn<typeof INDEX_QUERY, unknown>
  tags: SyncTag[]
  fetchedAt: string
  revalidatedBy: RevalidatedBy
}> = async ({res, query}) => {
  const {lastLiveEventId} = query
  const {result: data, syncTags: tags = []} = await client.fetch(
    INDEX_QUERY,
    {slug},
    {
      // Needed to access syncTags
      filterResponse: false,
      // Tells the Sanity CDN which live event the response has to include
      lastLiveEventId,
      // The Vercel CDN revalidates this page right after a purge, so ask the Sanity CDN to wait for
      // fresh content instead of serving stale
      cacheMode: 'noStale',
    },
  )

  // The CDN keeps this response until `/api/revalidate-tags` purges one of its tags. The HTML and the
  // `_next/data` JSON both come through here, so both carry the tags.
  res.setHeader('Vercel-Cache-Tag', [SANITY_CACHE_TAG, ...tags.map(toCacheTag)].join(','))
  res.setHeader(
    'Cache-Control',
    'public, max-age=60, s-maxage=3600, stale-while-revalidate=60, stale-if-error=3600',
  )

  return {
    props: {data, tags, fetchedAt: new Date().toJSON(), revalidatedBy: resolveRevalidatedBy()},
  }
}

export default function Home(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const {data, tags, fetchedAt, revalidatedBy} = props
  const title = data.demo?.title || 'Next 14'

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
          <Suspense>
            <TimeSince label="index.tsx" since={fetchedAt} />
          </Suspense>
          <div className="relative mx-2 rounded-lg px-2 py-1 ring-1 ring-current">
            <h1 className="min-w-64 text-4xl leading-tight font-bold tracking-tighter text-balance md:text-6xl lg:text-8xl">
              {title}
            </h1>
          </div>
          <Suspense>
            <ThemeButton />
          </Suspense>
        </div>
        {Array.isArray(data.demo?.reactions) && <Reactions data={data.demo.reactions} />}
      </main>
      <SanityLive tags={tags} revalidatedBy={revalidatedBy} />
    </>
  )
}
