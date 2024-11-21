import {createFileRoute} from '@tanstack/react-router'
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
    <h1 className="text-balance text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:pr-8 lg:text-8xl">
      {state.data || 'TanStack Start Starter'}
    </h1>
  )
}
