import { useEffect, useMemo, useState } from 'react'

const LOADING_STEPS = [
  'Проверяем доступ и сессию',
  'Загружаем данные агента',
  'Собираем настройки и каналы',
  'Почти готово',
]

export function DashboardLoading() {
  const [progress, setProgress] = useState(8)
  const [dots, setDots] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setProgress((prev) => {
        if (prev >= 92) return 92
        if (prev < 60) return prev + 2
        return prev + 1
      })
    }, 220)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(() => {
      setDots((prev) => (prev + 1) % 4)
    }, 380)

    return () => window.clearInterval(timer)
  }, [])

  const stepText = useMemo(() => {
    if (progress < 35) return LOADING_STEPS[0]
    if (progress < 65) return LOADING_STEPS[1]
    if (progress < 85) return LOADING_STEPS[2]
    return LOADING_STEPS[3]
  }, [progress])

  return (
    <div className="dashboard-loading" role="status" aria-live="polite">
      <div className="dashboard-loading-head">
        <div className="dashboard-loading-spinner" aria-hidden="true" />
        <div>
          <p className="dashboard-loading-title">Загружаем личный кабинет{'.'.repeat(dots)}</p>
          <p className="dashboard-loading-step">{stepText}</p>
        </div>
      </div>

      <div className="dashboard-loading-progress" aria-hidden="true">
        <div className="dashboard-loading-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <p className="dashboard-loading-percent">{progress}%</p>

      <div className="dashboard-loading-grid" aria-hidden="true">
        <div className="dashboard-loading-card" />
        <div className="dashboard-loading-row" />
        <div className="dashboard-loading-row" />
        <div className="dashboard-loading-row short" />
      </div>
    </div>
  )
}
