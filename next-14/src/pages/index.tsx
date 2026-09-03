import {Reactions} from '@/components/Reactions'
import {client} from '@/sanity/client'
import {SanityLive} from '@/sanity/live'
import {INDEX_PAGE, resolveRevalidatedBy, type RevalidatedBy} from '@/sanity/revalidation'
import type {ClientReturn, SyncTag} from '@sanity/client'
import type {GetStaticProps, InferGetStaticPropsType} from 'next'
import Head from 'next/head'
import {lazy, Suspense} from 'react'

const ThemeButton = lazy(() => import('@/components/ThemeButton'))
const TimeSince = lazy(() => import('@/components/TimeSince'))

export const getStaticProps: GetStaticProps<{
  data: ClientReturn<typeof INDEX_PAGE.query, unknown>
  tags: SyncTag[]
  fetchedAt: string
  revalidatedBy: RevalidatedBy
}> = async () => {
  const {result: data, syncTags: tags = []} = await client.fetch(
    INDEX_PAGE.query,
    INDEX_PAGE.params,
    {
      // Needed to access syncTags
      filterResponse: false,
      // This page is regenerated right after an invalidation, so ask the Sanity CDN to wait for fresh content instead of serving stale
      cacheMode: 'noStale',
    },
  )

  return {
    props: {data, tags, fetchedAt: new Date().toJSON(), revalidatedBy: resolveRevalidatedBy()},
    // On-demand revalidation through `/api/revalidate-tags` keeps this page fresh. The hourly fallback covers a missed event.
    revalidate: 3600,
  }
}

export default function Home(props: InferGetStaticPropsType<typeof getStaticProps>) {
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
