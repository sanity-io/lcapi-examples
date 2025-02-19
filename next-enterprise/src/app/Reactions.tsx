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

const REACTION_QUERY = defineQuery(`*[_type == "reaction" && _id == $id][0]{emoji,reactions}`)

export async function Reaction(props: {_ref: string}) {
  const {_ref} = props

  const data = sanityFetch({query: REACTION_QUERY, params: {id: _ref}}).then(({data}) => data)

  return (
    <ReactionButton
      onClick={async () => {
        'use server'

        const formData = new FormData()
        formData.append('id', _ref)
        await fetch('https://lcapi-examples-api.sanity.dev/api/react', {
          method: 'POST',
          body: formData,
        })
      }}
      data={data}
    />
  )
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
