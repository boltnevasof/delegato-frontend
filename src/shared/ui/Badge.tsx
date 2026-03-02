type BadgeProps = {
  variant?: 'default' | 'popular' | 'soon' | 'success' | 'plan' | 'error'
  children: string
}

export function Badge({ variant = 'default', children }: BadgeProps) {
  const cls = variant === 'default' ? 'badge' : `badge badge--${variant}`
  return <span className={cls}>{children}</span>
}
