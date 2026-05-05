import type {QueryParams} from '@sanity/client'
import type {LiveLoader} from 'astro/loaders'
import {client} from '../sanity/client'

interface SanityEntryFilter {
  id: string
  query: string
  params?: QueryParams
}

interface SanityCollectionFilter {
  query: string
  params?: QueryParams
}

export interface SanityEntryData {
  [key: string]: unknown
}

export function sanityLoader(): LiveLoader<
  SanityEntryData,
  SanityEntryFilter,
  SanityCollectionFilter
> {
  return {
    name: 'sanity-live-loader',
    async loadEntry({filter}) {
      const {result} = await client.fetch(filter.query, filter.params ?? {}, {
        filterResponse: false,
      })

      if (!result) {
        return undefined
      }

      return {
        id: filter.id,
        data: result,
      }
    },
    async loadCollection({filter}) {
      if (!filter) {
        return {entries: []}
      }

      const {result} = await client.fetch(filter.query, filter.params ?? {}, {
        filterResponse: false,
      })

      if (!Array.isArray(result)) {
        return {entries: []}
      }

      return {
        entries: result.map((item: Record<string, unknown>, index: number) => ({
          id: (item._id as string) || String(index),
          data: item,
        })),
      }
    },
  }
}
