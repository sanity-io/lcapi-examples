import './globals.css'
import {sanityFetch} from '@/sanity/fetch'
import {defineQuery} from 'groq'
import {Suspense} from 'react'
import {SanityLive} from './SanityLive'
import {ThemeButton} from './ThemeButton'
import {TimeSince} from './TimeSince'

const THEME_QUERY = defineQuery(`*[_id == "theme"][0]{background,text,"fetchedAt":now()}`)
/**
 * Used in a Server Action to mutate the theme, this tag sets the tag in the query, and provides a stable handle to call in the custom action
 */
const themeTag = 'theme'

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const {data} = await sanityFetch({query: THEME_QUERY, tags: [themeTag]})

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
              <ThemeButton tags={[themeTag]} />
            </Suspense>
        </div>
        <Suspense>
          <SanityLive />
        </Suspense>
      </body>
    </html>
  )
}
