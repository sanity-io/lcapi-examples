'use client'

import {startTransition, useEffect, useState} from 'react'

export function TimeSince({
  label,
  since,
  rendered,
}: {
  label: string
  since: string
  rendered: string
}) {
  const [now, setNow] = useState<null | Date>(null)
  useEffect(() => {
    const interval = setInterval(() => startTransition(() => setNow(new Date())), 1_000)
    return () => clearInterval(interval)
  }, [])

  let value = '…'
  if (now) {
    const fetchedSince = formatTimeSince(new Date(since), now)
    const renderedSince = formatTimeSince(new Date(rendered), now)
    value =
      fetchedSince === renderedSince
        ? `fetched & rendered ${fetchedSince}`
        : `fetched ${fetchedSince}, rendered ${renderedSince}`
  }
  return (
    <div className="absolute top-2 left-2 block rounded-sm bg-(--theme-text) text-[0.5rem] text-(--theme-background) transition-colors duration-1000 ease-in-out">
      <span className="inline-block py-1 pr-0.5 pl-2">{label}:</span>
      <span className="mr-0.5 inline-block rounded-r-sm bg-(--theme-background) px-1 py-0.5 text-(--theme-text) tabular-nums transition-colors duration-1000 ease-in-out">
        {value}
      </span>
    </div>
  )
}

const rtf = new Intl.RelativeTimeFormat('en', {style: 'short'})
export function formatTimeSince(from: Date, to: Date): string {
  const seconds = Math.floor((from.getTime() - to.getTime()) / 1000)
  if (seconds > -60) {
    return rtf.format(Math.min(seconds, -1), 'second')
  }
  const minutes = Math.ceil(seconds / 60)
  if (minutes > -60) {
    return rtf.format(minutes, 'minute')
  }
  const hours = Math.ceil(minutes / 60)
  if (hours > -24) {
    return rtf.format(hours, 'hour')
  }
  const days = Math.ceil(hours / 24)
  return rtf.format(days, 'day')
}
