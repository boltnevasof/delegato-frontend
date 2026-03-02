import type { ReactNode } from 'react'

type CardProps = {
  header?: ReactNode
  footer?: ReactNode
  selected?: boolean
  disabled?: boolean
  className?: string
  children: ReactNode
}

export function Card({ header, footer, selected, disabled, className = '', children }: CardProps) {
  const classes = [
    'card',
    selected && 'card--selected',
    disabled && 'card--disabled',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={classes}>
      {header && <div className="mb-16">{header}</div>}
      {children}
      {footer && <div className="mt-16">{footer}</div>}
    </div>
  )
}
