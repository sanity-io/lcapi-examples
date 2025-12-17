'use client'

import {useTransition} from 'react'
import {randomColorTheme} from './actions'

export function ThemeButton() {
  const [pending, startTransition] = useTransition()
  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(() =>
          randomColorTheme().then((data) => {
            if (data?.background && data?.text) {
              document.documentElement.style.setProperty('--theme-background', data.background)
              document.documentElement.style.setProperty('--theme-text', data.text)
            }
          }),
        )
      }
      className={`bg-theme-button text-theme-button focus:ring-theme focus:ring-offset-theme focus:ring-opacity-50 cursor-pointer rounded-md px-4 py-2 text-sm font-semibold transition ease-in-out select-none focus:ring-2 focus:ring-offset-2 focus:outline-hidden focus:duration-0 disabled:cursor-not-allowed disabled:opacity-50 ${pending ? 'animate-pulse cursor-wait duration-150' : 'duration-1000'} `}
    >
      {pending ? 'Generating...' : 'Random Color Theme'}
    </button>
  )
}
