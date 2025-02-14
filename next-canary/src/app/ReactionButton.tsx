'use client'

import {AnimatePresence, motion} from 'framer-motion'
import {startTransition, useEffect, useOptimistic, useState, useTransition} from 'react'
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
  const [pending, startTransition] = useTransition()

  return (
    <div className="relative aspect-square">
      <button
        className="bg-(--theme-text)/40 flex items-center justify-center rounded-lg text-2xl transition duration-1000 ease-in-out hover:duration-300 focus:duration-300"
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
      <FloatingReactions pending={pending} reactions={optimisticReactions} emoji={emoji} />
    </div>
  )
}

function FloatingReactions(props: {pending: boolean; reactions: number; emoji: string}) {
  const [initialReactions] = useState(props.reactions)
  const reactions = Math.max(0, props.reactions - initialReactions)
  const [emojis, setEmojis] = useState<{createdAt: number; key: string; done: boolean}[]>([])
  const {pending} = props

  /**
   * Add new emojis, one by one, to stagger them, until they match the length of the current reactions
   */
  useEffect(() => {
    if (reactions > emojis.length) {
      console.log({pending})
      const insert = () =>
        setEmojis((emojis) => [
          ...emojis,
          {
            createdAt: Math.max(
              Date.now(),
              emojis.at(-1)?.createdAt ? emojis.at(-1)!.createdAt + 60 : 0,
            ),
            key: crypto.randomUUID(),
            done: false,
          },
        ])
      if (pending) {
        insert()
        return
      }
      const timeout = setTimeout(() => insert(), 60)
      return () => clearTimeout(timeout)
    }
  }, [emojis.length, reactions, pending])

  /**
   * Garbage collect emojis that are done animating
   */
  useEffect(() => {
    const expired = (now: number, createdAt: number) => now - createdAt > 9_000
    const interval = setInterval(() => {
      startTransition(() =>
        setEmojis((emojis) => {
          const now = Date.now()
          if (emojis.some(({createdAt}) => expired(now, createdAt))) {
            return emojis.map((emoji) => ({
              ...emoji,
              done: expired(now, emoji.createdAt),
            }))
          }
          return emojis
        }),
      )
    }, 9_000)
    return () => clearInterval(interval)
  }, [])

  const pendingEmojis = emojis.filter(({done}) => !done)

  return (
    <AnimatePresence>
      {pendingEmojis.map(({key}) => (
        <FloatingEmoji key={key} emoji={props.emoji} />
      ))}
    </AnimatePresence>
  )
}

type FloatingEmojiProps = {
  emoji: string
}
function FloatingEmoji({emoji}: FloatingEmojiProps) {
  const randomOffset = (Math.random() - 0.5) * 200 // Increased range for more spread

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
        y: '-90dvh',
        x: [0, randomOffset * 0.3, randomOffset],
        opacity: [0, 1, 1, 0.8, 0],
        scale: [0.5, 1.2, 1, 1, 0.8],
      }}
      transition={{
        duration: 4, // Increased duration
        ease: 'easeOut',
      }}
    >
      {emoji}
    </motion.div>
  )
}
