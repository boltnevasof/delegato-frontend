import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getCurrent, changeTariff, reactivate } from '../../api/subscriptions'
import { getTariffs } from '../../api/tariffs'
import { getHistory } from '../../api/payments'
import { useApiError } from '../../shared/hooks/useApiError'
import { Button, Badge, ErrorBanner, Spinner } from '../../shared/ui'
import { DashboardEmpty } from '../dashboard/DashboardEmpty'
import { CancelModal } from './CancelModal'

function formatPrice(kopecks: number): string {
  return `${(kopecks / 100).toLocaleString('ru-RU')} ₽`
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU')
}

export function SubscriptionPage() {
  const queryClient = useQueryClient()
  const { error, setError, clearError } = useApiError()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [gracePeriodEnd, setGracePeriodEnd] = useState<string | null>(null)
  const [changingTariffId, setChangingTariffId] = useState<string | null>(null)
  const [reactivating, setReactivating] = useState(false)
  const [prorationMessage, setProrationMessage] = useState<string | null>(null)

  const subQuery = useQuery({ queryKey: ['subscription'], queryFn: getCurrent })
  const tariffsQuery = useQuery({ queryKey: ['tariffs'], queryFn: getTariffs })
  const historyQuery = useQuery({ queryKey: ['paymentHistory'], queryFn: () => getHistory(1, 20) })

  const sub = subQuery.data
  const tariffs = tariffsQuery.data?.tariffs ?? []
  const payments = historyQuery.data?.items ?? []

  async function handleChangeTariff(tariffId: string) {
    clearError()
    setChangingTariffId(tariffId)
    setProrationMessage(null)
    try {
      const result = await changeTariff(tariffId)
      setProrationMessage(
        `Тариф изменён. Корректировка: ${formatPrice(result.proration_amount_rub)}. ${result.message}`
      )
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
    } catch (err) {
      setError(err)
    } finally {
      setChangingTariffId(null)
    }
  }

  async function handleReactivate() {
    clearError()
    setReactivating(true)
    try {
      await reactivate()
      setGracePeriodEnd(null)
      queryClient.invalidateQueries({ queryKey: ['subscription'] })
    } catch (err) {
      setError(err)
    } finally {
      setReactivating(false)
    }
  }

  function handleCancelled(gpEnd: string, _message: string) {
    setGracePeriodEnd(gpEnd)
    queryClient.invalidateQueries({ queryKey: ['subscription'] })
  }

  if (subQuery.isLoading || tariffsQuery.isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Spinner />
      </div>
    )
  }

  if (subQuery.error || tariffsQuery.error) {
    if ((subQuery.error as { status?: number })?.status === 404) {
      return <DashboardEmpty />
    }
    const msg = (subQuery.error as { message?: string })?.message
      ?? (tariffsQuery.error as { message?: string })?.message
      ?? 'Не удалось загрузить данные подписки'
    return (
      <ErrorBanner
        message={msg}
        onRetry={() => { subQuery.refetch(); tariffsQuery.refetch() }}
      />
    )
  }

  const isCancelled = sub?.status === 'cancelled' || gracePeriodEnd !== null

  return (
    <div className="subscription-page">
      <h1>Подписка</h1>

      {error && <ErrorBanner message={error.message} />}
      {prorationMessage && <div className="success-banner">{prorationMessage}</div>}

      {sub && (
        <div className="current-plan">
          <div className="current-plan-info">
            <span className="current-plan-name">{sub.tariff.name}</span>
            <span className="current-plan-sep">&middot;</span>
            <span className="current-plan-price">{formatPrice(sub.tariff.price_rub)}/мес</span>
            <span className="current-plan-sep">&middot;</span>
            <span className="current-plan-date">следующее списание {formatDate(sub.current_period_end)}</span>
            {sub.payment_method && (
              <>
                <span className="current-plan-sep">&middot;</span>
                <span className="current-plan-date">{sub.payment_method}</span>
              </>
            )}
          </div>
          <div className="current-plan-actions">
            {isCancelled ? (
              <>
                {gracePeriodEnd && (
                  <span className="current-plan-date">
                    активна до <strong>{formatDate(gracePeriodEnd)}</strong>
                  </span>
                )}
                <Button size="small" loading={reactivating} onClick={handleReactivate}>
                  Возобновить
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => alert('Смена карты будет доступна позже')}
                >
                  Сменить карту
                </Button>
                <button className="current-plan-cancel" onClick={() => setCancelOpen(true)}>
                  Отменить
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <h2 className="mt-32">Доступные тарифы</h2>
      <div className="tariff-grid">
        {tariffs.map((tariff) => {
          const isCurrent = sub?.tariff.slug === tariff.slug
          return (
            <div key={tariff.id} className={`tariff-card ${isCurrent ? 'tariff-card--current' : ''}`}>
              <h3 className="tariff-card-name">
                {tariff.name}
                {isCurrent && <Badge variant="plan">Текущий</Badge>}
              </h3>
              <div className="tariff-card-price">{formatPrice(tariff.price_rub)}<span>/мес</span></div>

              <ul className="tariff-card-features">
                {tariff.llm_model && <li>Модель: {tariff.llm_model}</li>}
                {tariff.max_channels !== null && <li>Каналов: до {tariff.max_channels}</li>}
                <li>Скиллы: {tariff.skills_access}</li>
              </ul>

              {!isCurrent && !isCancelled && (
                <Button
                  style={{ width: '100%' }}
                  loading={changingTariffId === tariff.id}
                  disabled={changingTariffId !== null}
                  onClick={() => handleChangeTariff(tariff.id)}
                >
                  Перейти на план
                </Button>
              )}
            </div>
          )
        })}
      </div>

      <h2 className="mt-32">История платежей</h2>
      {historyQuery.isLoading ? (
        <Spinner />
      ) : payments.length === 0 ? (
        <p className="text-muted">Платежей пока нет</p>
      ) : (
        <table className="payment-table">
          <thead>
            <tr>
              <th>Дата</th>
              <th className="text-right">Сумма</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id}>
                <td>{formatDate(p.created_at)}</td>
                <td className="text-right">{formatPrice(p.amount_rub)}</td>
                <td><Badge>{p.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <CancelModal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onCancelled={handleCancelled}
      />
    </div>
  )
}
