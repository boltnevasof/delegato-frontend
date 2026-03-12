type SpinnerProps = {
  size?: 'sm' | 'md'
}

export function Spinner({ size = 'md' }: SpinnerProps) {
  return <span className={`spinner-loading spinner-loading--${size}`} aria-label="Загрузка..." />
}
