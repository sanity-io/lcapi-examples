import {sanityFetch} from '@/utils/sanity'
import {createFileRoute} from '@tanstack/react-router'
import {createServerFn} from '@tanstack/react-start'
import {defineQuery} from 'groq'
import z from 'zod'

const DEMO_QUERY = defineQuery(`*[_type == "demo" && slug.current == $slug][0].title`)

const getDemo = createServerFn({
  method: 'GET',
})
  .inputValidator(
    z.object({
      lastLiveEventId: z.string().optional(),
      slug: z.string(),
    }),
  )
  .handler(({data: {slug, lastLiveEventId}}) => {
    return sanityFetch({query: DEMO_QUERY, params: {slug}, lastLiveEventId})
  })

export const Route = createFileRoute('/')({
  component: App,

  loaderDeps: ({search: {lastLiveEventId}}) => ({lastLiveEventId}),
  loader: async ({deps: {lastLiveEventId}}) =>
    await getDemo({data: {slug: 'tanstack-start', lastLiveEventId}}),
  head: (ctx) => ({
    meta: [{title: ctx.loaderData?.data || 'TanStack Start Starter'}],
  }),
})

function App() {
  const state = Route.useLoaderData()
  return (
    <>
      <h1 className="text-balance text-4xl font-bold leading-tight tracking-tighter [view-transition-name:title] md:text-6xl lg:pr-8 lg:text-8xl">
        {state.data || 'TanStack Start Starter'}
      </h1>
    </>
  )
}
