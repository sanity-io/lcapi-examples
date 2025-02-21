'use client'

import {AnimatePresence, motion} from 'framer-motion'
import {memo, startTransition, use, useEffect, useOptimistic, useState} from 'react'
import {ReactionFallback, Square} from './ReactionPrimitives'

interface Emoji {
  key: string
  delay: number
  done: boolean
}

function createEmoji(delay: number) {
  return {
    key: crypto.randomUUID(),
    delay,
    done: false,
  }
}

function insert(emojis: Emoji[], delay: number) {
  return [...emojis, createEmoji(delay)]
}

function insertMany(emojis: Emoji[], needed: number) {
  const stagger = 10_000 / needed
  const nextEmojis = [...emojis]
  for (let i = 0; i < needed; i++) {
    nextEmojis.push(createEmoji(i * stagger))
  }
  return nextEmojis
}

export function ReactionButton(props: {
  onClick: () => void
  data: Promise<{
    emoji: string | null
    reactions: number | null
  } | null>
}) {
  const {onClick} = props
  const data = use(props.data)

  if (!data?.emoji || typeof data.reactions !== 'number') {
    return <ReactionFallback />
  }

  return <EmojiReactionButton onClick={onClick} emoji={data.emoji} reactions={data.reactions} />
}

function EmojiReactionButton(props: {onClick: () => void; emoji: string; reactions: number}) {
  const {onClick, emoji, reactions} = props
  const [initialReactions] = useState(reactions)

  const [emojis, setEmojis] = useState<Emoji[]>([])
  const [optimisticReactions, optimisticallyInc] = useOptimistic<number, number>(
    reactions,
    (currentState, optimisticInc) => currentState + optimisticInc,
  )
  const nextReactions = Math.max(0, optimisticReactions - initialReactions)

  useEffect(() => {
    if (nextReactions > emojis.length) {
      const needed = nextReactions - emojis.length
      setEmojis((emojis) => insertMany(emojis, needed))
    }
  }, [nextReactions, emojis.length])

  const pendingEmojis = emojis.filter(({done}) => !done).slice(0, 100)

  return (
    <div className="bg-(--theme-text)/40 focus-within:ring-(--theme-text) focus-within:ring-offset-(--theme-background) relative aspect-square rounded-lg transition duration-1000 ease-in-out focus-within:ring-2 focus-within:ring-offset-2 focus-within:duration-0">
      <motion.button
        className="flex transform-gpu cursor-pointer select-none items-center justify-center text-2xl subpixel-antialiased will-change-transform focus:outline-none"
        onClick={() => {
          setEmojis((emojis) => insert(emojis, 0))
          startTransition(async () => {
            optimisticallyInc(1)
            await onClick()
          })
        }}
        whileTap={{scale: 0.8}}
      >
        <Square>{emoji}</Square>
      </motion.button>
      <AnimatePresence>
        {pendingEmojis.map(({key, delay}) => (
          <FloatingEmoji key={key} _key={key} emoji={emoji} delay={delay} setEmojis={setEmojis} />
        ))}
      </AnimatePresence>
    </div>
  )
}

type FloatingEmojiProps = {
  _key: string
  emoji: string
  delay: number
  setEmojis: React.Dispatch<React.SetStateAction<Emoji[]>>
}
const FloatingEmoji = memo(function FloatingEmoji({
  emoji,
  delay,
  _key,
  setEmojis,
}: FloatingEmojiProps) {
  const [randomOffset] = useState((Math.random() - 0.5) * 200)
  const [randomDelay] = useState(Math.random() * 0.15) // Add up to 150ms random delay

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 flex select-none items-center justify-center text-2xl will-change-transform"
      initial={{
        opacity: 0,
        scale: 0.5,
        x: 0,
        y: 0,
      }}
      animate={{
        y: '-94dvh',
        x: [0, randomOffset * 0.3, randomOffset],
        opacity: [0, 1, 1, 0.8, 0],
        scale: [0.5, 1.2, 1, 1, 0.8],
      }}
      transition={{
        duration: 4 - randomDelay,
        delay: delay / 1000 + randomDelay,
        ease: 'easeOut',
      }}
      onAnimationComplete={() => {
        setEmojis((emojis) => emojis.map((e) => (e.key === _key ? {...e, done: true} : e)))
      }}
    >
      {emoji}
    </motion.div>
  )
})
