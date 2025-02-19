import {sanityFetch} from '@/sanity/fetch'
import {defineQuery} from 'groq'
import {ReactionButton} from './ReactionButton'
import {ReactionFallback} from './ReactionPrimitives'

interface Props {
  data: {
    _key: string
    _ref: string
  }[]
}

/**
 * Without `'use cache'` we don't have much to gain from running parallel queries for each reaction, it's faster to run them in a single GROQ query
 */

const REACTIONS_QUERY = defineQuery(`*[_type == "reaction" && _id in $ids]{_id,emoji,reactions}`)

export async function Reactions(props: Props) {
  const {data} = props
  const {data: reactions} = await sanityFetch({
    query: REACTIONS_QUERY,
    params: {ids: data.map(({_ref}) => _ref)},
  })

  return (
    <Wrapper>
      {data.map(({_key, _ref}) => {
        const item = reactions.find(({_id}) => _id === _ref)
        if (item?.emoji && typeof item.reactions === 'number') {
          const {emoji, reactions} = item
          return (
            <ReactionButton
              key={_key}
              onClick={async () => {
                'use server'

                const formData = new FormData()
                formData.append('id', _ref)
                await fetch('https://lcapi-examples-api.sanity.dev/api/react', {
                  method: 'POST',
                  body: formData,
                })
              }}
              data={{emoji, reactions}}
            />
          )
        }

        return <ReactionFallback key={_key} />
      })}
    </Wrapper>
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
