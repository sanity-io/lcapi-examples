import {startTransition, useEffect, useState} from 'react'

export default function TimeSince({label, since}: {label: string; since: string}) {
  const [from, setFrom] = useState<null | Date>(null)
  const [now, setNow] = useState<null | Date>(null)
  useEffect(() => {
    startTransition(() => setFrom(new Date(since)))
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [since])

  let timeSince = '…'
  if (from && now) {
    timeSince = formatTimeSince(from, now)
  }

  return (
    <div className="bg-theme-button text-theme-button absolute top-2 left-2 block rounded text-[0.5rem] transition duration-1000 ease-in-out">
      <span className="inline-block py-1 pr-0.5 pl-2">{label}:</span>
      <span className="bg-theme text-theme mr-0.5 inline-block rounded-r-sm px-1 py-0.5 tabular-nums transition duration-1000 ease-in-out">
        fetched {timeSince}
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
