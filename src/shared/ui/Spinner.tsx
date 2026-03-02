type SpinnerProps = {
  size?: number
}

export function Spinner({ size = 32 }: SpinnerProps) {
  return (
    <div
      className="spinner"
      style={{ width: size, height: size }}
    />
  )
}
