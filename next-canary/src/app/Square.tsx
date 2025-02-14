export function Square({children}: {children: React.ReactNode}) {
  return (
    <div className="inline-flex aspect-square size-12 items-center justify-center">{children}</div>
  )
}

export function ButtonContainer({children}: {children: React.ReactNode}) {
  return <div className="relative aspect-square">{children}</div>
}
