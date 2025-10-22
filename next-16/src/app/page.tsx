import {sanityFetch} from '@/sanity/fetch'
import {defineQuery} from 'groq'
import {Suspense} from 'react'
import {Reactions} from './Reactions'
import {TimeSince} from './TimeSince'

const DEMO_QUERY = defineQuery(
  `*[_type == "demo" && slug.current == $slug][0]{title,reactions[0..4]{_key,_ref},"fetchedAt": now()}`,
)
const slug = 'next-16'

export default async function Home() {
  const {data} = await sanityFetch({query: DEMO_QUERY, params: {slug}})
  const title = data?.title || 'Next 16'

  return (
    <div className="relative mx-2 rounded-lg px-2 pb-1 pt-8 ring-1 ring-current">
      <title>{title}</title>
      <h1 className="min-w-64 text-balance text-4xl font-bold leading-tight tracking-tighter md:text-6xl lg:pr-8 lg:text-8xl">
        {title}
      </h1>
      {data?.fetchedAt && (
        <Suspense>
          <TimeSince label="page.tsx" since={data.fetchedAt} />
        </Suspense>
      )}
      {Array.isArray(data?.reactions) && <Reactions data={data.reactions} />}
    </div>
  )
}
