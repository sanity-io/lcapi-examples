'use client'

import type {SyncTag} from '@sanity/client'
import {useTransition} from 'react'
import {randomColorTheme} from './actions'

export function ThemeButton() {
  const [pending, startTransition] = useTransition()
  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await randomColorTheme()
          // Wait 2 seconds to stagger requests a little bit
          await new Promise((resolve) => setTimeout(resolve, 2_000))
        })
      }
      className={`bg-theme-button text-theme-button focus:ring-theme focus:ring-offset-theme rounded-md px-4 py-2 text-sm font-semibold transition ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-offset-2 focus:duration-0 disabled:cursor-not-allowed disabled:opacity-50 ${pending ? 'animate-pulse cursor-wait duration-150' : 'duration-1000'} `}
    >
      {pending ? 'Generating...' : 'Random Color Theme'}
    </button>
  )
}
