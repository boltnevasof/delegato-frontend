import { useEffect, type ReactNode } from 'react'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  footer?: ReactNode
  wide?: boolean
  className?: string
  children: ReactNode
}

export function Modal({ open, onClose, title, footer, wide, className = '', children }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal ${wide ? 'modal--wide' : ''} ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-16">
          <h3 className="modal-title">{title}</h3>
          <button className="btn btn--link modal-close-btn" onClick={onClose}>&times;</button>
        </div>
        {children}
        {footer && <div className="modal-actions">{footer}</div>}
      </div>
    </div>
  )
}
