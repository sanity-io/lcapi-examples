'use client'

import {AnimatePresence, motion} from 'framer-motion'
import {startTransition, useLayoutEffect, useOptimistic, useState} from 'react'
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

  const [originX, setOriginX] = useState(0)
  const [originY, setOriginY] = useState(0)

  return (
    <>
      <button
        ref={(node) => {
          if (node) {
            const rect = node.getBoundingClientRect()
            setOriginX(rect.left + rect.width / 2)
            setOriginY(rect.top)
          }
        }}
        className="bg-(--theme-text)/40 inline-flex items-center justify-center rounded-lg text-2xl transition duration-1000 ease-in-out hover:duration-300 focus:duration-300"
        title={`Fetched at ${fetchedAt}`}
        onClick={() => {
          startTransition(async () => {
            optimisticallyInc(1)
            await onClick()
          })
        }}
      >
        <Square>{emoji}</Square>
      </button>
      <FloatingReactions
        reactions={optimisticReactions}
        emoji={emoji}
        originX={originX}
        originY={originY}
      />
    </>
  )
}

function FloatingReactions(props: {
  reactions: number
  emoji: string
  originX: number
  originY: number
}) {
  const {originX, originY} = props
  const [initialReactions] = useState(props.reactions)
  const [currentReactions, setCurrentReactions] = useState(props.reactions)

  if (props.reactions > initialReactions && currentReactions !== props.reactions) {
    startTransition(() => setCurrentReactions(props.reactions))
  }

  const floatingEmojis: React.ReactNode[] = []

  const count = Math.max(0, currentReactions - initialReactions)
  for (let i = 0; i < count; i++) {
    floatingEmojis.push(
      <FloatingEmoji key={i} emoji={props.emoji} originX={originX} originY={originY} />,
    )
  }

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <AnimatePresence>{floatingEmojis}</AnimatePresence>
    </div>
  )
}

type FloatingEmojiProps = {
  emoji: string
  originX: number
  originY: number
}
function FloatingEmoji({emoji}: FloatingEmojiProps) {
  const randomOffset = (Math.random() - 0.5) * 200 // Increased range for more spread
  const [innerHeight, setInnerHeight] = useState(0)

  useLayoutEffect(() => {
    // Set initial height and update on resize
    const updateHeight = () => setInnerHeight(window.innerHeight)
    updateHeight()
    window.addEventListener('resize', updateHeight)
    return () => window.removeEventListener('resize', updateHeight)
  }, [])

  return (
    <motion.div
      className="pointer-events-none fixed text-2xl"
      style={{
        position: 'fixed',
        left: 0,
        bottom: 0,
      }}
      initial={{
        opacity: 0,
        scale: 0.5,
        x: 0,
        y: 0,
      }}
      animate={{
        y: -innerHeight * 0.6,
        x: [0, randomOffset * 0.3, randomOffset],
        opacity: [0, 1, 1, 0.8, 0],
        scale: [0.5, 1.2, 1, 1, 0.8],
      }}
      transition={{
        duration: 8, // Increased duration
        ease: 'easeOut',
        opacity: {
          duration: 7,
          times: [0, 0.1, 0.6, 0.8, 1],
        },
        scale: {
          duration: 8,
          times: [0, 0.2, 0.4, 0.8, 1],
        },
        x: {
          duration: 8,
          times: [0, 0.5, 1],
          ease: 'easeOut',
        },
        y: {
          duration: 8,
          ease: [0.32, 0.72, 0, 1],
        },
      }}
      exit={{opacity: 0, scale: 0}}
    >
      {emoji}
    </motion.div>
  )
}
