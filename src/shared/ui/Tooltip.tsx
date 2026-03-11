import { useState } from 'react'

type TooltipProps = {
  text: string
}

export function Tooltip({ text }: TooltipProps) {
  const [visible, setVisible] = useState(false)

  return (
    <span className="tooltip-wrapper">
      <button
        type="button"
        className="tooltip-trigger"
        aria-label="Подсказка"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
      >
        ?
      </button>
      {visible && (
        <span className="tooltip-popup" role="tooltip">
          {text}
        </span>
      )}
    </span>
  )
}
