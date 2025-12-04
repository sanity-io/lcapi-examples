import {TanStackDevtools} from '@tanstack/react-devtools'
import {createRootRoute, HeadContent, Scripts} from '@tanstack/react-router'
import {TanStackRouterDevtoolsPanel} from '@tanstack/react-router-devtools'
import {createServerFn} from '@tanstack/react-start'
import {zodValidator} from '@tanstack/zod-adapter'
import {injectSpeedInsights} from '@vercel/speed-insights'
import {defineQuery} from 'groq'
import {z} from 'zod'

import {SanityLive} from '@/components/SanityLive'
import {ThemeButton} from '@/components/ThemeButton'
import {sanityFetch} from '@/utils/sanity'

import appCss from '../styles.css?url'

if (typeof window !== 'undefined') {
  injectSpeedInsights()
}

const THEME_QUERY = defineQuery(`*[_id == "theme"][0]{background,text}`)

const getTheme = createServerFn({
  method: 'GET',
})
  .inputValidator(
    z.object({
      lastLiveEventId: z.string().optional(),
    }),
  )
  .handler(({data: {lastLiveEventId}}) => {
    return sanityFetch({query: THEME_QUERY, lastLiveEventId})
  })

export const Route = createRootRoute({
  validateSearch: zodValidator(
    z.object({
      lastLiveEventId: z.string().optional(),
    }),
  ),
  loaderDeps: ({search: {lastLiveEventId}}) => ({lastLiveEventId}),
  loader: ({deps}) => getTheme({data: deps}),

  head: () => ({
    meta: [
      {charSet: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
      {title: 'TanStack Start Starter'},
    ],
    links: [
      {rel: 'stylesheet', href: appCss},
      {rel: 'icon', type: 'image/png', href: '/favicon.png'},
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({children}: {children: React.ReactNode}) {
  const {data} = Route.useLoaderData()

  return (
    <html
      lang="en"
      className="bg-theme text-theme transition-colors duration-1000 ease-in-out"
      style={{
        ['--theme-background' as string]: data?.background,
        ['--theme-text' as string]: data?.text,
      }}
    >
      <head>
        <HeadContent />
      </head>
      <body>
        <RootLayout>{children}</RootLayout>
        <SanityLive />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-evenly overflow-auto">
      {children}
      <ThemeButton />
    </div>
  )
}
