import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getChannels, updateChannel } from '../../api/channels'
import { useApiError } from '../../shared/hooks/useApiError'
import { ErrorBanner, Spinner, Modal, Button } from '../../shared/ui'
import { DashboardEmpty } from '../dashboard/DashboardEmpty'
import { ChannelCard, UpcomingChannelCard, UPCOMING_CHANNELS } from './ChannelCard'

export function ChannelPage() {
  const queryClient = useQueryClient()
  const { error, setError, clearError } = useApiError()
  const [disconnectId, setDisconnectId] = useState<string | null>(null)
  const [acting, setActing] = useState(false)

  const { data, isLoading, error: queryError, refetch } = useQuery({
    queryKey: ['channels'],
    queryFn: getChannels,
  })

  async function handleDisconnect() {
    if (!disconnectId) return
    clearError()
    setActing(true)
    try {
      await updateChannel(disconnectId, 'disconnected')
      queryClient.invalidateQueries({ queryKey: ['channels'] })
      setDisconnectId(null)
    } catch (err) {
      setError(err)
    } finally {
      setActing(false)
    }
  }

  async function handleReconnect(channelId: string) {
    clearError()
    try {
      await updateChannel(channelId, 'connected')
      queryClient.invalidateQueries({ queryKey: ['channels'] })
    } catch (err) {
      setError(err)
    }
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Spinner />
      </div>
    )
  }

  if (queryError) {
    if ((queryError as { status?: number }).status === 404) {
      return <DashboardEmpty />
    }
    return (
      <ErrorBanner
        message={(queryError as { message?: string }).message ?? 'Не удалось загрузить каналы'}
        onRetry={() => refetch()}
      />
    )
  }

  const channels = data?.channels ?? []

  return (
    <div className="page-wrap">
      <h1>Каналы связи</h1>

      {error && <ErrorBanner message={error.message} />}

      {channels.length === 0 && (
        <p className="text-muted">Нет подключённых каналов</p>
      )}

      <div className="channel-list">
        {channels.map((channel) => (
          <ChannelCard
            key={channel.id}
            channel={channel}
            onReconnect={handleReconnect}
            onDisconnect={(id) => setDisconnectId(id)}
          />
        ))}

        {UPCOMING_CHANNELS.map((type) => (
          <UpcomingChannelCard key={type} type={type} />
        ))}
      </div>

      <Modal
        open={disconnectId !== null}
        onClose={() => setDisconnectId(null)}
        title="Отключить канал"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDisconnectId(null)} disabled={acting}>
              Отмена
            </Button>
            <Button variant="danger" loading={acting} onClick={handleDisconnect}>
              Отключить
            </Button>
          </>
        }
      >
        <p>Вы уверены, что хотите отключить этот канал связи?</p>
      </Modal>
    </div>
  )
}
