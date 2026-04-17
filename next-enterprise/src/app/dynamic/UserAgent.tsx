import {headers} from 'next/headers'

export async function UserAgent() {
  const headersList = await headers()
  const userAgent = headersList.get('user-agent')

  return (
    <div className="absolute bottom-2 left-2 block rounded-sm bg-(--theme-text) text-xs text-(--theme-background) transition-colors duration-1000 ease-in-out">
      <span className="inline-block py-1 pr-0.5 pl-2">User Agent:</span>
      <span className="mr-0.5 inline-block rounded-r-sm bg-(--theme-background) px-1 py-0.5 text-(--theme-text) tabular-nums transition-colors duration-1000 ease-in-out">
        {userAgent}
      </span>
    </div>
  )
}
