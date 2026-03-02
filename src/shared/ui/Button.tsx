import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'small' | 'medium' | 'large'
  loading?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const variantClass = variant === 'ghost' ? 'btn--link' : `btn--${variant}`
  const sizeClass = size === 'small' ? 'btn--small' : size === 'large' ? 'btn--large' : ''

  return (
    <button
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : children}
    </button>
  )
}
