import {createFileRoute, Link} from '@tanstack/react-router'
import {createServerFn} from '@tanstack/start'
import {defineQuery} from 'groq'
import {z} from 'zod'
import {sanityFetch} from '../utils/sanity'

const DEMO_QUERY = defineQuery(`*[_type == "demo" && slug.current == $slug][0].title`)

const getDemo = createServerFn({
  method: 'GET',
})
  .validator(
    z.object({
      lastLiveEventId: z.string().optional(),
      slug: z.string(),
    }),
  )
  .handler(({data: {slug, lastLiveEventId}}) => {
    return sanityFetch({query: DEMO_QUERY, params: {slug}, lastLiveEventId})
  })

export const Route = createFileRoute('/')({
  component: Home,
  loaderDeps: ({search: {lastLiveEventId}}) => ({lastLiveEventId}),
  loader: async ({deps: {lastLiveEventId}}) =>
    await getDemo({data: {slug: 'tanstack-start', lastLiveEventId}}),
  head: (ctx) => ({
    meta: [{title: ctx.loaderData?.data || 'TanStack Start Starter'}],
  }),
})

function Home() {
  const state = Route.useLoaderData()

  return (
    <>
      <h1 className="text-balance text-4xl font-bold leading-tight tracking-tighter [view-transition-name:title] md:text-6xl lg:pr-8 lg:text-8xl">
        {state.data || 'TanStack Start Starter'}
      </h1>
      <Link
        className="bg-theme text-theme ring-theme focus:bg-theme-button hover:bg-theme-button hover:text-theme-button focus:text-theme-button w-56 rounded-md px-4 py-2 text-sm font-semibold ring-2 ring-opacity-75 [view-transition-name:search] focus:outline-none"
        to="/goto"
        search={(prev) => ({...prev})}
      >
        Go to...
      </Link>
    </>
  )
}
