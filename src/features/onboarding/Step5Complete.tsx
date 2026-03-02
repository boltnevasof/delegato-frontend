import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { onboardingComplete } from '../../api/agents'
import { useAsyncTask } from '../../shared/hooks/useAsyncTask'
import { useApiError } from '../../shared/hooks/useApiError'
import { Button, ErrorBanner, Spinner } from '../../shared/ui'
import { OnboardingLayout } from './OnboardingLayout'

export function Step5Complete() {
  const navigate = useNavigate()
  const { error, setError, clearError } = useApiError()
  const [taskId, setTaskId] = useState<string | null>(null)
  const [started, setStarted] = useState(false)
  const [immediateSuccess, setImmediateSuccess] = useState(false)
  const hasTriggered = useRef(false)

  const { status, error: taskError, isPolling } = useAsyncTask(started ? taskId : null)

  // Trigger onboarding/complete on mount
  useEffect(() => {
    if (hasTriggered.current) return
    hasTriggered.current = true

    onboardingComplete()
      .then((response) => {
        if (response.task_id === null || response.task_id === undefined) {
          // null task_id = completed successfully (per I2 decision)
          setImmediateSuccess(true)
        } else {
          setTaskId(response.task_id)
        }
        setStarted(true)
      })
      .catch((err) => {
        setError(err)
        setStarted(true)
      })
  }, [setError])

  const isSuccess = immediateSuccess || (started && status === 'completed')
  const isFailed = started && status === 'failed'
  const isBuilding = started && !immediateSuccess && !isSuccess && !isFailed && !error

  function handleRetry() {
    clearError()
    hasTriggered.current = false
    setTaskId(null)
    setStarted(false)
    setImmediateSuccess(false)

    onboardingComplete()
      .then((response) => {
        if (response.task_id === null || response.task_id === undefined) {
          setImmediateSuccess(true)
        } else {
          setTaskId(response.task_id)
        }
        setStarted(true)
      })
      .catch((err) => {
        setError(err)
        setStarted(true)
      })
  }

  return (
    <OnboardingLayout step={5} label="Готово!">
      {!started && !error && (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <Spinner />
          <p className="text-muted mt-16">Запускаем создание агента...</p>
        </div>
      )}

      {error && (
        <>
          <ErrorBanner message={error.message} />
          <div className="form-actions" style={{ justifyContent: 'center' }}>
            <Button onClick={handleRetry}>Попробовать снова</Button>
            <Button variant="secondary" onClick={() => navigate('/support')}>
              Написать в поддержку
            </Button>
          </div>
        </>
      )}

      {isBuilding && (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <Spinner />
          <h2>Создаём вашего агента...</h2>
          <p className="text-muted">
            {isPolling ? 'Это может занять пару минут' : 'Подготавливаем...'}
          </p>
        </div>
      )}

      {isFailed && (
        <>
          <div style={{ textAlign: 'center' }}>
            <div className="styled-indicator styled-indicator--error">{'\u2717'}</div>
            <h2>Не удалось создать агента</h2>
            <p className="text-muted">{taskError ?? 'Произошла ошибка при создании агента'}</p>
          </div>
          <div className="form-actions" style={{ justifyContent: 'center' }}>
            <Button onClick={handleRetry}>Попробовать снова</Button>
            <Button variant="secondary" onClick={() => navigate('/support')}>
              Написать в поддержку
            </Button>
          </div>
        </>
      )}

      {isSuccess && (
        <div style={{ textAlign: 'center' }}>
          <div className="styled-indicator styled-indicator--success">{'\u2713'}</div>
          <h2>Ваш агент готов!</h2>
          <p className="text-muted mb-16">
            Агент создан и готов к работе. Вы можете открыть его в Telegram или перейти на панель управления.
          </p>
          <div className="form-actions" style={{ justifyContent: 'center', gap: 12 }}>
            <Button onClick={() => navigate('/dashboard', { replace: true })}>
              Перейти в дашборд
            </Button>
          </div>
        </div>
      )}
    </OnboardingLayout>
  )
}
