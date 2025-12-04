'use cache'

import './globals.css'
import {SpeedInsights} from '@vercel/speed-insights/next'
import {defineQuery} from 'groq'
import {Suspense} from 'react'

import {sanityFetch} from '@/sanity/fetch'

import {SanityLive} from './SanityLive'
import {ThemeLayout} from './ThemeLayout'
import {TimeSince} from './TimeSince'

const THEME_QUERY = defineQuery(`*[_id == "theme"][0]{background,text}`)

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const {data, tags, fetchedAt} = await sanityFetch({query: THEME_QUERY, tags: ['theme']})
  console.log('RootLayout', data, tags)

  return (
    <ThemeLayout background={data?.background} text={data?.text}>
      <Suspense>
        <TimeSince label="layout.tsx" since={fetchedAt} rendered={new Date().toJSON()} />
      </Suspense>
      {children}
      <Suspense>
        <SanityLive />
      </Suspense>
      <SpeedInsights />
    </ThemeLayout>
  )
}
