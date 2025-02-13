'use client'

import {startTransition, useOptimistic} from 'react'
import {Square} from './Square'

export function ReactionButton(props: {
  onClick: () => void
  emoji: string
  reactions: number
  fetchedAt: string
}) {
  const {onClick, fetchedAt, emoji, reactions} = props

  const [optimisticReactions, optimisticallyInc] = useOptimistic<number, number>(
    reactions,
    (currentState, optimisticInc) => currentState + optimisticInc,
  )
  return (
    <button
      className="bg-(--theme-text)/40 rounded-lg transition duration-1000 ease-in-out hover:duration-300 focus:duration-300"
      title={`Fetched at ${fetchedAt}`}
      onClick={() => {
        startTransition(async () => {
          optimisticallyInc(1)
          await onClick()
        })
      }}
    >
      <Square>
        {emoji}
        {optimisticReactions}
      </Square>
    </button>
  )
}
