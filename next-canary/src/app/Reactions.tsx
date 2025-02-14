import {sanityFetch} from '@/sanity/fetch'
import {defineQuery} from 'groq'
import {unstable_expireTag as expireTag} from 'next/cache'
import {Suspense} from 'react'
import {ReactionButton} from './ReactionButton'
import {ButtonContainer, Square} from './Square'

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

const REACTION_QUERY = defineQuery(
  `*[_type == "reaction" && _id == $id][0]{emoji,reactions,"fetchedAt":now()}`,
)

export async function Reaction(props: {_ref: string}) {
  const {_ref} = props

  const {data, tags} = await sanityFetch({query: REACTION_QUERY, params: {id: _ref}})

  if (!data?.emoji || typeof data.reactions !== 'number') {
    return <ReactionFallback />
  }

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
        console.log({tags})
        if (Array.isArray(tags)) expireTag(...tags)
      }}
      emoji={data.emoji}
      fetchedAt={data.fetchedAt}
      reactions={data.reactions}
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

function ReactionFallback() {
  return (
    <ButtonContainer>
      <button
        disabled
        className="bg-(--theme-text)/40 flex animate-pulse rounded-lg transition-colors duration-1000 ease-in-out"
      >
        <Square> </Square>
      </button>
    </ButtonContainer>
  )
}

function Wrapper({children}: {children: React.ReactNode}) {
  return (
    <aside className="bg-(--theme-text)/30 fixed bottom-2 left-[50%] grid -translate-x-[50%] grid-flow-col grid-rows-1 gap-2 rounded-xl p-2 transition-colors duration-1000 ease-in-out">
      {children}
    </aside>
  )
}
