export function ReactionFallback() {
  return (
    <ButtonContainer>
      <button
        disabled
        className="flex animate-pulse rounded-lg bg-(--theme-text)/40 transition-colors duration-1000 ease-in-out"
      >
        <Square> </Square>
      </button>
    </ButtonContainer>
  )
}

export function Square({children}: {children: React.ReactNode}) {
  return (
    <div className="inline-flex aspect-square size-12 items-center justify-center">{children}</div>
  )
}

function ButtonContainer({children}: {children: React.ReactNode}) {
  return <div className="relative aspect-square">{children}</div>
}
