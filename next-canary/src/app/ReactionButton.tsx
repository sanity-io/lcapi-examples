'use client'

import {AnimatePresence, motion} from 'framer-motion'
import {startTransition, useEffect, useOptimistic, useState} from 'react'
import {Square} from './Square'

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

export function ReactionButton(props: {
  onClick: () => void
  emoji: string
  reactions: number
  fetchedAt: string
}) {
  const {onClick, fetchedAt, emoji, reactions} = props
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
      startTransition(() =>
        setEmojis((emojis) => {
          const nextEmojis = [...emojis]
          for (let i = 0; i < needed; i++) {
            nextEmojis.push(createEmoji(i * 60))
          }
          return nextEmojis
        }),
      )
    }
  }, [nextReactions, emojis.length])

  const pendingEmojis = emojis.filter(({done}) => !done)

  return (
    <div className="bg-(--theme-text)/40 relative aspect-square rounded-lg transition duration-1000 ease-in-out">
      <motion.button
        className="flex transform-gpu items-center justify-center text-2xl"
        title={`Fetched at ${fetchedAt}`}
        onClick={() => {
          setEmojis((emojis) => insert(emojis, 0))
          startTransition(async () => {
            optimisticallyInc(1)
            await onClick()
          })
        }}
        whileHover={{scale: 1.2}}
        whileTap={{scale: 0.95}}
      >
        <Square>{emoji}</Square>
      </motion.button>
      <AnimatePresence>
        {pendingEmojis.map(({key, delay}) => (
          <FloatingEmoji
            key={key}
            _key={key}
            emoji={props.emoji}
            delay={delay}
            setEmojis={setEmojis}
          />
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
function FloatingEmoji({emoji, delay, _key, setEmojis}: FloatingEmojiProps) {
  const randomOffset = (Math.random() - 0.5) * 200 // Increased range for more spread

  useEffect(() => {
    const timeout = setTimeout(() => {
      setEmojis((emojis) => emojis.map((e) => (e.key === _key ? {...e, done: true} : e)))
    }, delay + 4_000) // Increased delay
    return () => clearTimeout(timeout)
  }, [_key, delay, setEmojis])

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 flex items-center justify-center text-2xl"
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
        duration: 4, // Increased duration
        delay: delay / 1000,
        ease: 'easeOut',
      }}
    >
      {emoji}
    </motion.div>
  )
}
