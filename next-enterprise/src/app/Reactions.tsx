'use client'

/**
 * As the Emoji Reactions are a ton of numbers that increment constantly it's far more
 * efficient to fetch these counters client side than to have them pass through SSR.
 */
import {AnimatePresence, motion} from 'motion/react'
import {startTransition, useEffect, useRef, useState} from 'react'

import {client} from '@/sanity/client'

import type {RouteResponse} from './api/reaction/[id]/shared'

interface Props {
  data: {
    _key: string
    _ref: string
  }[]
}

export function Reactions(props: Props) {
  const {data} = props

  return (
    <aside className="bg-(--theme-text)/30 fixed bottom-2 left-[50%] grid -translate-x-[50%] grid-flow-col grid-rows-1 gap-2 rounded-2xl p-2 transition-colors duration-1000 ease-in-out">
      {data.map(({_key, _ref}) => (
        <Reaction key={_key} _ref={_ref} />
      ))}
    </aside>
  )
}
Reactions.displayName = 'Reactions'

function Reaction(props: {_ref: string}) {
  const {_ref} = props

  const [data, setData] = useState<RouteResponse['result']>(null)
  const [lastLiveEventId, setLastLiveEventId] = useState<string | null>(null)
  const syncTagsRef = useRef<RouteResponse['syncTags']>(undefined)

  useEffect(() => {
    const subscription = client.live.events().subscribe((event) => {
      const syncTags = syncTagsRef.current
      if (
        event.type === 'message' &&
        Array.isArray(syncTags) &&
        event.tags.some((tag) => syncTags.includes(tag))
      ) {
        setLastLiveEventId(event.id)
      }
    })
    return () => subscription.unsubscribe()
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    fetch(lastLiveEventId ? `/api/reaction/${_ref}/${lastLiveEventId}` : `/api/reaction/${_ref}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then(({result, syncTags}: RouteResponse) => {
        startTransition(() => {
          setData(result)
          syncTagsRef.current = syncTags
        })
      })
      .catch(console.error)

    return () => controller.abort()
  }, [_ref, lastLiveEventId])

  if (data?.emoji && typeof data.reactions === 'number') {
    return <ReactionButton id={_ref} emoji={data.emoji} reactions={data.reactions} />
  }

  return <ReactionFallback />
}

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

function ReactionButton(props: {id: string; emoji: string; reactions: number}) {
  const {id, emoji, reactions} = props
  const [initialReactions] = useState(reactions)

  const [emojis, setEmojis] = useState<Emoji[]>([])
  const nextReactions = Math.max(0, reactions - initialReactions)

  if (nextReactions > emojis.length) {
    const needed = nextReactions - emojis.length
    setEmojis((emojis) => insertMany(emojis, needed))
  }

  const pendingEmojis = emojis.filter(({done}) => !done).slice(0, 100)
  const delay = 8_000 / pendingEmojis.length

  return (
    <div className="bg-(--theme-text)/40 focus-within:ring-(--theme-text) focus-within:ring-offset-(--theme-background) relative aspect-square rounded-lg transition duration-1000 ease-in-out focus-within:ring-2 focus-within:ring-offset-2 focus-within:duration-0">
      <motion.button
        className="flex transform-gpu cursor-pointer select-none items-center justify-center text-2xl subpixel-antialiased will-change-transform focus:outline-none"
        onClick={() => {
          setEmojis((emojis) => insert(emojis, false))
          const formData = new FormData()
          formData.append('id', id)
          fetch('https://lcapi-examples-api.sanity.dev/api/react', {
            method: 'POST',
            body: formData,
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
function FloatingEmoji({emoji, _key, setEmojis, ...props}: FloatingEmojiProps) {
  const [delay] = useState(props.delay)
  const [randomOffset] = useState(() => (Math.random() - 0.5) * 200)
  const [randomDelay] = useState(() => (delay ? Math.random() * 0.15 : 0)) // Add up to 150ms random delay

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
        ('requestIdleCallback' in window ? requestIdleCallback : requestAnimationFrame)(() =>
          setEmojis((emojis) => emojis.map((e) => (e.key === _key ? {...e, done: true} : e))),
        )
      }
    >
      {emoji}
    </motion.div>
  )
}

function ReactionFallback() {
  return (
    <div className="relative aspect-square">
      <button
        disabled
        className="bg-(--theme-text)/40 flex animate-pulse rounded-lg transition-colors duration-1000 ease-in-out"
      >
        <Square> </Square>
      </button>
    </div>
  )
}

function Square({children}: {children: React.ReactNode}) {
  return (
    <div className="inline-flex aspect-square size-12 items-center justify-center">{children}</div>
  )
}
