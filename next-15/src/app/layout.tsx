import './globals.css'
import {sanityFetch, SanityLive} from '@/sanity/live'
import {SpeedInsights} from '@vercel/speed-insights/next'
import {defineQuery} from 'groq'
import {Suspense} from 'react'
import {ThemeLayout} from './ThemeLayout'
import {TimeSince} from './TimeSince'

const THEME_QUERY = defineQuery(`*[_id == "theme"][0]{background,text,"fetchedAt":now()}`)

export const preferredRegion = 'cdg1' // Paris is closest to Sanity Content Lake in Belgium

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const {data, tags} = await sanityFetch({query: THEME_QUERY, tags: ['theme']})
  console.log('RootLayout', data, tags)

  return (
    <ThemeLayout background={data?.background} text={data?.text}>
      {data?.fetchedAt && (
        <Suspense>
          <TimeSince label="layout.tsx" since={data.fetchedAt} />
        </Suspense>
      )}
      {children}
      <SanityLive requestTag="next-15" />
      <SpeedInsights />
    </ThemeLayout>
  )
}
