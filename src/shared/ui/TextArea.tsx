import { forwardRef, type TextareaHTMLAttributes } from 'react'

type TextAreaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string
  error?: string
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="form-group">
        {label && <label>{label}</label>}
        <textarea
          ref={ref}
          className={`form-input ${error ? 'input-error' : ''} ${className}`.trim()}
          {...props}
        />
        {error && <div className="form-error">{error}</div>}
      </div>
    )
  }
)
