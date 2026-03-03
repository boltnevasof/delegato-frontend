import { useQuery } from '@tanstack/react-query'
import { getAgent } from '../../api/agents'
import { getMe } from '../../api/users'
import { Card, Badge, ErrorBanner } from '../../shared/ui'
import { DashboardEmpty } from './DashboardEmpty'
import { DashboardLoading } from './DashboardLoading'

const STATUS_LABELS: Record<string, string> = {
  active: 'Активен',
  paused: 'Приостановлен',
  draft: 'Черновик',
  error: 'Ошибка',
}

const TARIFF_LABELS: Record<string, string> = {
  free: 'Бесплатный',
  starter: 'Стартовый',
  pro: 'Профессиональный',
  business: 'Бизнес',
  enterprise: 'Корпоративный',
}

function formatTariff(slug: string): string {
  return TARIFF_LABELS[slug] || slug
}

export function DashboardPage() {
  const agentQuery = useQuery({
    queryKey: ['agent'],
    queryFn: getAgent,
    retry: (failureCount, error) => {
      if ((error as { status?: number }).status === 404) return false
      return failureCount < 3
    },
  })

  const userQuery = useQuery({
    queryKey: ['user'],
    queryFn: getMe,
  })

  if (agentQuery.isLoading || userQuery.isLoading) {
    return (
      <div className="page-wrap">
        <DashboardLoading />
      </div>
    )
  }

  if (agentQuery.error) {
    const status = (agentQuery.error as { status?: number }).status
    if (status === 404) {
      return (
        <div className="page-wrap">
          <DashboardEmpty />
        </div>
      )
    }
    return (
      <div className="page-wrap">
        <ErrorBanner
          message={(agentQuery.error as { message?: string }).message || 'Не удалось загрузить данные агента'}
          onRetry={() => agentQuery.refetch()}
        />
      </div>
    )
  }

  if (userQuery.error) {
    return (
      <div className="page-wrap">
        <ErrorBanner
          message={(userQuery.error as { message?: string }).message || 'Не удалось загрузить профиль'}
          onRetry={() => userQuery.refetch()}
        />
      </div>
    )
  }

  const agent = agentQuery.data
  if (!agent) {
    return (
      <div className="page-wrap">
        <DashboardEmpty />
      </div>
    )
  }

  const user = userQuery.data
  const subscription = user?.subscription
  const statusLabel = STATUS_LABELS[agent.status] || agent.status
  const isActive = agent.status === 'active'

  return (
    <div className="page-wrap">
      <h1>Панель управления</h1>

      <Card className="mt-16">
        <div className="flex-between mb-16">
          <div className="flex-center" style={{ gap: '0.5rem' }}>
            <span className={`status-dot ${isActive ? 'status-dot--green' : 'status-dot--gray'}`} />
            <strong>{statusLabel}</strong>
          </div>
          {subscription && <Badge variant="plan">{formatTariff(subscription.tariff_slug)}</Badge>}
        </div>

        <div className="grid-stats mb-16">
          <div className="stat-item">
            <span className="stat-value">{agent.skills.length}</span>
            <span className="stat-label">Скиллов</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{agent.tools.length}</span>
            <span className="stat-label">Инструментов</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{agent.channels.length}</span>
            <span className="stat-label">Каналов</span>
          </div>
        </div>
      </Card>
    </div>
  )
}
