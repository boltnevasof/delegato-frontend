import type { components } from '../../api/generated/schema'
import { Button, Badge } from '../../shared/ui'

type ChannelResponse = components['schemas']['ChannelResponse']

const CHANNEL_LABELS: Record<string, string> = {
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
  email: 'Email',
}

const UPCOMING_CHANNELS = ['whatsapp', 'email']

type ChannelCardProps = {
  channel: ChannelResponse
  onReconnect: (id: string) => void
  onDisconnect: (id: string) => void
}

export function ChannelCard({ channel, onReconnect, onDisconnect }: ChannelCardProps) {
  const label = CHANNEL_LABELS[channel.channel_type] ?? channel.channel_type
  const isConnected = channel.status === 'connected'

  return (
    <div className="channel-card">
      <div className="channel-info">
        <div className="flex-center" style={{ gap: 8 }}>
          <span
            className={`status-dot ${isConnected ? 'status-dot--green' : 'status-dot--red'}`}
          />
          <strong>{label}</strong>
        </div>
        <Badge variant={isConnected ? 'success' : 'default'}>{channel.status}</Badge>
      </div>
      <div className="channel-actions">
        {isConnected ? (
          <Button variant="danger" size="small" onClick={() => onDisconnect(channel.id)}>
            Отключить
          </Button>
        ) : (
          <Button variant="secondary" size="small" onClick={() => onReconnect(channel.id)}>
            Переподключить
          </Button>
        )}
      </div>
    </div>
  )
}

type UpcomingChannelCardProps = {
  type: string
}

export function UpcomingChannelCard({ type }: UpcomingChannelCardProps) {
  const label = CHANNEL_LABELS[type] ?? type
  return (
    <div className="channel-card disabled">
      <div className="channel-info">
        <strong>{label}</strong>
        <Badge variant="soon">Скоро</Badge>
      </div>
      <div className="channel-actions">
        <Button variant="secondary" size="small" disabled>
          Скоро
        </Button>
      </div>
    </div>
  )
}

export { UPCOMING_CHANNELS }
