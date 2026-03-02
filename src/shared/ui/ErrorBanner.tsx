type ErrorBannerProps = {
  message: string
  onRetry?: () => void
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="error-banner">
      <strong>Error</strong>
      {message}
      {onRetry && (
        <div className="error-actions">
          <button className="btn btn--small" onClick={onRetry}>Retry</button>
        </div>
      )}
    </div>
  )
}
