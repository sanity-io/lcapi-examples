'use client'

import {useTransition} from 'react'
import {randomColorTheme} from './actions'

export function ThemeButton() {
  const [pending, startTransition] = useTransition()
  return (
    <button
      disabled={pending}
      onClick={() => startTransition(() => randomColorTheme())}
      className={`bg-theme-button text-theme-button focus:ring-theme focus:ring-offset-theme focus:outline-hidden cursor-pointer rounded-md px-4 py-2 text-sm font-semibold transition ease-in-out focus:ring-2 focus:ring-opacity-50 focus:ring-offset-2 focus:duration-0 disabled:cursor-not-allowed disabled:opacity-50 ${pending ? 'animate-pulse cursor-wait duration-150' : 'duration-1000'} `}
    >
      {pending ? 'Generating...' : 'Random Color Theme'}
    </button>
  )
}
