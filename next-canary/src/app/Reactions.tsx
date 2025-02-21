import {sanityFetch} from '@/sanity/fetch'
import {defineQuery} from 'groq'
import {Suspense} from 'react'
import {ReactionButton} from './ReactionButton'
import {ReactionFallback} from './ReactionPrimitives'

interface Props {
  data: {
    _key: string
    _ref: string
  }[]
}

export async function Reactions(props: Props) {
  const {data} = props

  return (
    <Wrapper>
      {data.map(({_key, _ref}) => (
        <Suspense key={_key} fallback={<ReactionFallback />}>
          <Reaction _ref={_ref} />
        </Suspense>
      ))}
    </Wrapper>
  )
}

/**
 * With `'use cache'` we can cache each reaction button separately, so it's better to run them in parallel queries
 */
const REACTION_QUERY = defineQuery(`*[_type == "reaction" && _id == $id][0]{emoji,reactions}`)

async function Reaction(props: {_ref: string}) {
  const {_ref} = props

  const {data} = await sanityFetch({query: REACTION_QUERY, params: {id: _ref}})

  if (data?.emoji && typeof data.reactions === 'number') {
    return <ReactionButton id={_ref} emoji={data.emoji} reactions={data.reactions} />
  }

  return <ReactionFallback />
}

export function ReactionsFallback(props: Props) {
  const {data} = props
  return (
    <Wrapper>
      {data.map(({_key}) => (
        <ReactionFallback key={_key} />
      ))}
    </Wrapper>
  )
}

function Wrapper({children}: {children: React.ReactNode}) {
  return (
    <aside className="bg-(--theme-text)/30 fixed bottom-2 left-[50%] grid -translate-x-[50%] grid-flow-col grid-rows-1 gap-2 rounded-2xl p-2 transition-colors duration-1000 ease-in-out">
      {children}
    </aside>
  )
}
