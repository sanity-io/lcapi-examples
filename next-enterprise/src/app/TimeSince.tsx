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
    <div className="bg-(--theme-text) text-(--theme-background) absolute left-2 top-2 block rounded-sm text-xs transition-colors duration-1000 ease-in-out">
      <span className="inline-block py-1 pl-2 pr-0.5">{label}:</span>
      <span className="bg-(--theme-background) text-(--theme-text) mr-0.5 inline-block rounded-r-sm px-1 py-0.5 tabular-nums transition-colors duration-1000 ease-in-out">
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
