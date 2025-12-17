import {useState} from 'react'

export default function ThemeButton() {
  const [pending, setPending] = useState(false)

  return (
    <button
      disabled={pending}
      onClick={() => {
        setPending(true)
        fetch('https://lcapi-examples-api.sanity.dev/api/random-color-theme', {
          method: 'PUT',
        }).finally(() => setPending(false))
      }}
      className={`cursor-pointer select-none rounded-md bg-theme-button px-4 py-2 text-sm font-semibold text-theme-button transition ease-in-out focus:outline-none focus:ring-2 focus:ring-theme focus:ring-opacity-50 focus:ring-offset-2 focus:ring-offset-theme focus:duration-0 disabled:cursor-not-allowed disabled:opacity-50 ${pending ? 'animate-pulse cursor-wait duration-150' : 'duration-1000'} `}
    >
      {pending ? 'Generating...' : 'Random Color Theme'}
    </button>
  )
}
