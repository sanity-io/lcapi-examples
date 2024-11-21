import type {Viewport} from 'next'
import './globals.css'
import {sanityFetch} from '@/sanity/fetch'
import {defineQuery} from 'groq'
import {Suspense} from 'react'
import {SanityLive} from './SanityLive'
import {ThemeButton} from './ThemeButton'
import {TimeSince} from './TimeSince'

const THEME_QUERY = defineQuery(`*[_id == "theme"][0]{background,text}`)

export async function generateViewport(): Promise<Viewport> {
  const {data} = await sanityFetch({query: THEME_QUERY})
  return {
    themeColor: data?.background,
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const {data, tags, fetchedAt} = await sanityFetch({query: THEME_QUERY})

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
        <div className="relative flex min-h-screen flex-col items-center justify-evenly overflow-auto">
          <Suspense>
            <TimeSince label="layout.tsx" since={fetchedAt} />
          </Suspense>
          {children}
          <Suspense>
            <ThemeButton tags={tags!} />
          </Suspense>
        </div>
        <Suspense>
          <SanityLive />
        </Suspense>
      </body>
    </html>
  )
}
