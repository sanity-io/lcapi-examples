/**
 * The point of running this through an API route is it can cache and coalesce API requests to reduce the API hits on Content Lake in
 * the same predictable way as data fetching in React Server Components achieve.
 */

import {client} from '@/sanity/client'
import {NextResponse} from 'next/server'
import {API_REACTION_QUERY, type RouteResponse} from '../route'

export const dynamic = 'force-static'

export async function GET(
  request: Request,
  {params}: {params: Promise<{id: string; lastLiveEventId: string}>},
): Promise<NextResponse<RouteResponse>> {
  const {id, lastLiveEventId} = await params
  const {result, syncTags} = await client.fetch(
    API_REACTION_QUERY,
    {id},
    {filterResponse: false, lastLiveEventId, returnQuery: false},
  )

  return NextResponse.json<RouteResponse>({result, syncTags})
}
