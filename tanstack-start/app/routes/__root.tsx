import {createRootRoute, Outlet, ScrollRestoration} from '@tanstack/react-router'
import {TanStackRouterDevtools} from '@tanstack/router-devtools'
import {createServerFn, Meta, Scripts} from '@tanstack/start'
import {zodValidator} from '@tanstack/zod-adapter'
import {defineQuery} from 'groq'
import {type ReactNode} from 'react'
import {z} from 'zod'
import {SanityLive} from '../components/SanityLive'
import {ThemeButton} from '../components/ThemeButton'
import appCss from '../styles/app.css?url'
import {sanityFetch} from '../utils/sanity'

const THEME_QUERY = defineQuery(`*[_id == "theme"][0]{background,text}`)

const getTheme = createServerFn({
  method: 'GET',
})
  .validator(
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
  head: ({loaderData}) => ({
    meta: [
      {charSet: 'utf-8'},
      {name: 'viewport', content: 'width=device-width, initial-scale=1'},
      {title: 'TanStack Start Starter'},
      {name: 'theme-color', content: loaderData?.data?.background || '#000'},
    ],
    links: [
      {rel: 'stylesheet', href: appCss},
      {rel: 'icon', type: 'image/png', href: '/favicon.png'},
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <div className="flex min-h-dvh flex-col items-center justify-evenly overflow-auto">
        <Outlet />
        <ThemeButton />
      </div>
    </RootDocument>
  )
}

function RootDocument({children}: Readonly<{children: ReactNode}>) {
  const {data} = Route.useLoaderData()
  return (
    <html
      className="bg-theme text-theme transition-colors duration-1000 ease-in-out"
      style={{
        ['--theme-background' as string]: data?.background,
        ['--theme-text' as string]: data?.text,
      }}
    >
      <head>
        <Meta />
      </head>
      <body>
        {children}
        <SanityLive />
        <ScrollRestoration />
        <Scripts />
        <TanStackRouterDevtools />
      </body>
    </html>
  )
}
