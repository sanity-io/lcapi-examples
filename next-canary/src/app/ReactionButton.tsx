'use client'

import {startTransition, useCallback, useEffect, useOptimistic, useRef, useState} from 'react'
import { motion, AnimatePresence } from "framer-motion"
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
  return (<>
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
    <FloatingReactions reactions={optimisticReactions} />
    </>
  )
}

function FloatingReactions(props: {reactions: number}) {
  const {reactions} = props
  const [initialReactions] = useState(props.reactions)

  console.log(reactions, initialReactions)
  /*
<div className="absolute inset-0 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {floatingEmojis.map(({ emoji, id, x, y }) => (
            <FloatingEmoji key={id} emoji={emoji} originX={x} originY={y} />
          ))}
        </AnimatePresence>
      </div>
  // */
  
  return null
}





type Reaction = {
  emoji: string
  count: number
}

type FloatingEmojiProps = {
  emoji: string
  originX: number
  originY: number
}

const FloatingEmoji: React.FC<FloatingEmojiProps> = ({ emoji, originX, originY }) => {
  const randomOffset = (Math.random() - 0.5) * 100 // Random horizontal drift

  return (
    <motion.div
      className="absolute text-2xl pointer-events-none"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        x: originX,
        y: originY,
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        y: originY - window.innerHeight,
        x: originX + randomOffset,
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1, 1, 0.8],
      }}
      transition={{
        duration: 4,
        ease: "easeOut",
        opacity: { duration: 3 },
      }}
    >
      {emoji}
    </motion.div>
  )
}

const EmojiReactions: React.FC = () => {
  const [reactions, setReactions] = useState<Reaction[]>([
    { emoji: "❤️", count: 0 },
    { emoji: "👍", count: 0 },
    { emoji: "😂", count: 0 },
    { emoji: "😮", count: 0 },
    { emoji: "😢", count: 0 },
  ])

  const [floatingEmojis, setFloatingEmojis] = useState<{ emoji: string; id: number; x: number; y: number }[]>([])
  const nextEmojiId = useRef(0)

  const handleReaction = useCallback(
    (emoji: string, event: React.MouseEvent<HTMLButtonElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const originX = rect.left + rect.width / 2
      const originY = rect.top

      setReactions((prev) =>
        prev.map((reaction) => (reaction.emoji === emoji ? { ...reaction, count: reaction.count + 1 } : reaction)),
      )

      // Add new floating emojis
      const newEmojis = Array(Math.min(reactions.find((r) => r.emoji === emoji)?.count || 0 + 1, 5))
        .fill(null)
        .map(() => ({
          emoji,
          id: nextEmojiId.current++,
          x: originX,
          y: originY,
        }))

      setFloatingEmojis((prev) => [...prev, ...newEmojis])

      // Remove emojis after animation completes
      setTimeout(() => {
        setFloatingEmojis((prev) => prev.slice(newEmojis.length))
      }, 4000)

      console.log(`Emoji clicked: ${emoji}, Position: (${originX}, ${originY})`)
    },
    [reactions],
  )

  useEffect(() => {
    console.log("Floating emojis:", floatingEmojis)
  }, [floatingEmojis])

  return (
    <div className="relative h-screen bg-gradient-to-b from-blue-400 to-purple-500">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <AnimatePresence>
          {floatingEmojis.map(({ emoji, id, x, y }) => (
            <FloatingEmoji key={id} emoji={emoji} originX={x} originY={y} />
          ))}
        </AnimatePresence>
      </div>
      <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-4 p-4 bg-white bg-opacity-20 backdrop-blur-md">
        {reactions.map((reaction) => (
          <motion.button
            key={reaction.emoji}
            className="text-3xl p-2 rounded-full bg-white bg-opacity-50 hover:bg-opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={(e) => handleReaction(reaction.emoji, e)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            {reaction.emoji}
          </motion.button>
        ))}
      </div>
    </div>
  )
}


