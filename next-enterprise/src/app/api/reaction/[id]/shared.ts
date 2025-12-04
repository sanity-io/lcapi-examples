import type {ClientReturn, SyncTag} from '@sanity/client'

import {defineQuery} from 'groq'

export const API_REACTION_QUERY = defineQuery(
  `*[_type == "reaction" && _id == $id][0]{emoji,reactions}`,
)

export interface RouteResponse {
  result: ClientReturn<typeof API_REACTION_QUERY, unknown>
  syncTags: SyncTag[] | undefined
}
