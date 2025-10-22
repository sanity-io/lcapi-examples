/**
 * The point of running this through an API route is it can cache and coalesce API requests to reduce the API hits on Content Lake in
 * the same predictable way as data fetching in React Server Components achieve.
 */

import {client} from '@/sanity/client'
import {defineQuery} from 'groq'
import {NextResponse} from 'next/server'
import {API_REACTION_QUERY, RouteResponse} from './shared'

const REACTION_QUERY_STATIC_PARAMS = defineQuery(
  `*[_type == "demo" && slug.current == $slug][0].reactions[0..4]{"id": _ref}`,
)

export async function generateStaticParams() {
  const ids = await client.fetch(REACTION_QUERY_STATIC_PARAMS, {slug: 'next-enterprise'})
  if (!Array.isArray(ids)) return []
  return ids
}

export async function GET(
  request: Request,
  {params}: {params: Promise<{id: string}>},
): Promise<NextResponse<RouteResponse>> {
  const {id} = await params
  const {result, syncTags} = await client.fetch(
    API_REACTION_QUERY,
    {id},
    {filterResponse: false, returnQuery: false},
  )

  return NextResponse.json<RouteResponse>({result, syncTags})
}
