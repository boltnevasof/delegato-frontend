import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTariffs } from '../../api/tariffs'
import { subscribe } from '../../api/payments'
import { useAuth } from '../../shared/hooks/useAuth'
import { useApiError } from '../../shared/hooks/useApiError'
import { Button, ErrorBanner, Spinner } from '../../shared/ui'

function formatPrice(kopecks: number): string {
  return `${(kopecks / 100).toLocaleString('ru-RU')} ₽`
}

export function ChoosePlanPage() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { error, setError, clearError } = useApiError()
  const [subscribingId, setSubscribingId] = useState<string | null>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['tariffs'],
    queryFn: getTariffs,
  })

  async function handleSubscribe(tariffId: string) {
    clearError()
    setSubscribingId(tariffId)
    try {
      const result = await subscribe(tariffId)
      window.location.href = result.payment_url
    } catch (err) {
      setError(err)
      setSubscribingId(null)
    }
  }

  function handleLogout() {
    logout()
    navigate('/auth', { replace: true })
  }

  const tariffs = data?.tariffs ?? []

  return (
    <div className="choose-plan-layout">
      <header className="choose-plan-header">
        <span className="header-logo">Delegato</span>
        <button className="choose-plan-logout" onClick={handleLogout}>
          Выйти
        </button>
      </header>

      <div className="choose-plan-content">
        <h1>Выберите тариф</h1>
        <p className="text-muted">Для начала работы выберите подходящий план</p>

        {error && (
          <ErrorBanner message={error.message} onRetry={() => { clearError(); refetch() }} />
        )}

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <Spinner />
          </div>
        ) : (
          <div className="choose-plan-grid">
            {tariffs.map((tariff, i) => {
              const isPopular = i === 1
              return (
                <div
                  key={tariff.id}
                  className={`choose-plan-card ${isPopular ? 'choose-plan-card--popular' : ''}`}
                >
                  {isPopular && <div className="choose-plan-badge">Популярный</div>}
                  <h3>{tariff.name}</h3>
                  <div className="choose-plan-price">
                    {formatPrice(tariff.price_rub)}
                    <span>/мес</span>
                  </div>

                  <ul className="choose-plan-features">
                    {tariff.llm_model && <li>Модель: {tariff.llm_model}</li>}
                    {tariff.max_channels !== null && <li>Каналов: до {tariff.max_channels}</li>}
                    <li>Скиллы: {tariff.skills_access}</li>
                    {tariff.is_self_service && <li>Self-service настройка</li>}
                  </ul>

                  <Button
                    variant={isPopular ? 'primary' : 'secondary'}
                    style={{ width: '100%' }}
                    loading={subscribingId === tariff.id}
                    disabled={subscribingId !== null}
                    onClick={() => handleSubscribe(tariff.id)}
                  >
                    Выбрать план
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
