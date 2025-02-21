'use client'

import {AnimatePresence, motion} from 'framer-motion'
import {memo, startTransition, useEffect, useState} from 'react'
import {Square} from './ReactionPrimitives'

interface Emoji {
  key: string
  stagger: boolean
  done: boolean
}

function createEmoji(stagger: boolean) {
  return {
    key: crypto.randomUUID(),
    stagger,
    done: false,
  }
}

function insert(emojis: Emoji[], stagger: boolean) {
  return [...emojis, createEmoji(stagger)]
}

function insertMany(emojis: Emoji[], needed: number) {
  const nextEmojis = [...emojis]
  for (let i = 0; i < needed; i++) {
    nextEmojis.push(createEmoji(true))
  }
  return nextEmojis
}

export function ReactionButton(props: {id: string; emoji: string; reactions: number}) {
  const {id, emoji, reactions} = props
  const [initialReactions] = useState(reactions)

  const [emojis, setEmojis] = useState<Emoji[]>([])
  const nextReactions = Math.max(0, reactions - initialReactions)

  useEffect(() => {
    if (nextReactions > emojis.length) {
      const needed = nextReactions - emojis.length
      startTransition(() => setEmojis((emojis) => insertMany(emojis, needed)))
    }
  }, [nextReactions, emojis.length])

  const pendingEmojis = emojis.filter(({done}) => !done).slice(0, 100)
  const delay = 8_000 / pendingEmojis.length

  return (
    <div className="bg-(--theme-text)/40 focus-within:ring-(--theme-text) focus-within:ring-offset-(--theme-background) relative aspect-square rounded-lg transition duration-1000 ease-in-out focus-within:ring-2 focus-within:ring-offset-2 focus-within:duration-0">
      <motion.button
        className="flex transform-gpu cursor-pointer select-none items-center justify-center text-2xl subpixel-antialiased will-change-transform focus:outline-none"
        onClick={() => {
          setEmojis((emojis) => insert(emojis, false))
          startTransition(async () => {
            const formData = new FormData()
            formData.append('id', id)
            await fetch('https://lcapi-examples-api.sanity.dev/api/react', {
              method: 'POST',
              body: formData,
            })
          })
        }}
        whileTap={{scale: 0.8}}
      >
        <Square>{emoji}</Square>
      </motion.button>
      <AnimatePresence>
        {pendingEmojis.map(({key, stagger}, i) => (
          <FloatingEmoji
            key={key}
            _key={key}
            emoji={emoji}
            delay={stagger ? i * delay : 0}
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
const FloatingEmoji = memo(function FloatingEmoji({
  emoji,
  _key,
  setEmojis,
  ...props
}: FloatingEmojiProps) {
  const [delay] = useState(props.delay)
  const [randomOffset] = useState((Math.random() - 0.5) * 200)
  const [randomDelay] = useState(delay ? Math.random() * 0.15 : 0) // Add up to 150ms random delay

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
      onAnimationComplete={() =>
        requestIdleCallback(() =>
          setEmojis((emojis) => emojis.map((e) => (e.key === _key ? {...e, done: true} : e))),
        )
      }
    >
      {emoji}
    </motion.div>
  )
})
