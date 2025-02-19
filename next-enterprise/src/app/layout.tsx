import './globals.css'
import {sanityFetch} from '@/sanity/fetch'
import {defineQuery} from 'groq'
import {Suspense} from 'react'
import {SanityLive} from './SanityLive'
import {ThemeButton} from './ThemeButton'
import {TimeSince} from './TimeSince'
import { SpeedInsights } from "@vercel/speed-insights/next"


const THEME_QUERY = defineQuery(
  `*[_id == "theme"][0]{background,text,"fetchedAt": dateTime(now())}`,
)

export const preferredRegion = 'cdg1' // Paris is closest to Sanity Content Lake in Belgium

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const {data} = await sanityFetch({query: THEME_QUERY})

  return (
    <html
      lang="en"
      className="bg-theme text-theme transition-colors duration-1000 ease-in-out"
      style={{
        ['--theme-background' as string]: data?.background,
        ['--theme-text' as string]: data?.text,
      }}
    >
      <body>
        <div className="relative flex min-h-dvh flex-col items-center justify-evenly overflow-auto">
          {data?.fetchedAt && (
            <Suspense>
              <TimeSince label="layout.tsx" since={data.fetchedAt} />
            </Suspense>
          )}
          {children}
          <Suspense>
            <ThemeButton />
          </Suspense>
        </div>
        <Suspense>
          <SanityLive />
        </Suspense>
        <SpeedInsights />
      </body>
    </html>
  )
}
