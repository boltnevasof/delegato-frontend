import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getTariffs } from '../../api/tariffs'
import { subscribe } from '../../api/payments'
import { useAuth } from '../../shared/hooks/useAuth'
import { useApiError } from '../../shared/hooks/useApiError'
import { Button, Card, Badge, ErrorBanner, Spinner } from '../../shared/ui'

function formatPrice(kopecks: number): string {
  return `${(kopecks / 100).toLocaleString('ru-RU')} ₽/мес`
}

export function PricingPage() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const { error, setError, clearError } = useApiError()
  const [subscribingId, setSubscribingId] = useState<string | null>(null)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['tariffs'],
    queryFn: getTariffs,
  })

  async function handleSubscribe(tariffId: string) {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }
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

  if (isLoading) {
    return (
      <div className="page-wrap">
        <div style={{ textAlign: 'center', padding: '4rem 0' }}>
          <Spinner />
        </div>
      </div>
    )
  }

  const tariffs = data?.tariffs ?? []

  return (
    <div className="page-wrap">
      <div className="auth-container" style={{ maxWidth: 900 }}>
        <h1>Выберите тариф</h1>
        <p className="subtitle">Начните использовать AI-ассистента прямо сейчас</p>

        {error && <ErrorBanner message={error.message} onRetry={() => { clearError(); refetch() }} />}

        <div className="pricing-grid">
          {tariffs.map((tariff) => (
            <Card key={tariff.id} className="pricing-card">
              <h3>{tariff.name}</h3>
              <div className="pricing-price">{formatPrice(tariff.price_rub)}</div>

              <ul className="pricing-features">
                {tariff.llm_model && (
                  <li>Модель: <strong>{tariff.llm_model}</strong></li>
                )}
                {tariff.max_channels !== null && (
                  <li>Каналов: до {tariff.max_channels}</li>
                )}
                <li>Доступ к скиллам: <Badge>{tariff.skills_access}</Badge></li>
                {tariff.is_self_service && <li>Self-service настройка</li>}
              </ul>

              <Button
                variant="primary"
                style={{ width: '100%' }}
                loading={subscribingId === tariff.id}
                disabled={subscribingId !== null}
                onClick={() => handleSubscribe(tariff.id)}
              >
                Оплатить
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
