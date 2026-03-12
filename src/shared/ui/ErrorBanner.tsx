type ErrorBannerProps = {
  message: string
  onRetry?: () => void
}

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="error-banner show">
      <strong>Ошибка:</strong> {message}
      {onRetry && (
        <button className="error-banner-retry" onClick={onRetry}>
          Повторить
        </button>
      )}
    </div>
  )
}
