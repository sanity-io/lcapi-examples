import {createFileRoute, Link} from '@tanstack/react-router'
import {createServerFn} from '@tanstack/start'
import {zodValidator} from '@tanstack/zod-adapter'
import {defineQuery} from 'groq'
import {useEffect, useId} from 'react'
import {z} from 'zod'
import {sanityFetch} from '../utils/sanity'

const SEARCH_QUERY = defineQuery(`{
  "title": *[_type == "demo" && slug.current == $slug][0].title,
  "urls": *[_type == "demo" && slug.current != $slug && [title,slug.current,url] match "*"+$q+"*"]{title,url}
}`)

const getDemo = createServerFn({
  method: 'GET',
})
  .validator(
    z.object({
      lastLiveEventId: z.string().optional(),
      slug: z.string(),
      q: z.string(),
    }),
  )
  .handler(({data: {slug, q, lastLiveEventId}}) => {
    return sanityFetch({
      query: SEARCH_QUERY,
      params: {slug, q},
      lastLiveEventId,
    })
  })

export const Route = createFileRoute('/goto')({
  component: Home,
  validateSearch: zodValidator(
    z.object({
      q: z.string().default(''),
    }),
  ),
  loaderDeps: ({search: {lastLiveEventId, q}}) => ({lastLiveEventId, q}),
  loader: async ({deps: {lastLiveEventId, q}}) =>
    await getDemo({data: {slug: 'tanstack-start', q, lastLiveEventId}}),
  head: (ctx) => ({
    meta: [{title: ctx.loaderData?.data?.title || 'TanStack Start Starter'}],
  }),
})

function Home() {
  const state = Route.useLoaderData()
  const {q} = Route.useSearch()
  const navigate = Route.useNavigate()
  const id = useId()

  // @TODO handle this server side
  useEffect(() => {
    if (!q) return
    const validUrl = state.data.urls.find((item) => item.url && new URL(item.url).hostname === q)
    if (validUrl?.url) {
      location.href = validUrl.url
    }
  }, [state.data.urls, q])

  return (
    <>
      <h1 className="text-balance text-4xl font-bold leading-tight tracking-tighter [view-transition-name:title] md:text-6xl lg:pr-8 lg:text-8xl">
        <Link to="/">{state.data?.title || 'TanStack Start Starter'}</Link>
      </h1>
      <input
        name="q"
        type="search"
        list={id}
        placeholder="Go to..."
        autoFocus
        className="bg-theme text-theme ring-theme placeholder:text-theme w-56 rounded-md px-4 py-2 text-sm font-semibold ring-2 ring-opacity-75 [view-transition-name:search] focus:outline-none"
        defaultValue={q}
        onInput={(event) => {
          const q = event.currentTarget.value
          navigate({
            search: (prev) => ({...prev, q}),
            replace: true,
            resetScroll: false,
          })
        }}
      />
      <datalist id={id}>
        {state.data.urls.map((item) => {
          if (!item || !item.title || !item.url) return null
          return (
            <option key={item.url} value={new URL(item.url).hostname}>
              {item.title}
            </option>
          )
        })}
      </datalist>
    </>
  )
}
