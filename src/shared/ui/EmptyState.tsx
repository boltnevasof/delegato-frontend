import type { ReactNode } from 'react'

type EmptyStateProps = {
  icon?: string
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      {icon && <div className="icon">{icon}</div>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}
