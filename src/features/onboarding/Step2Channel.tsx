import { useNavigate } from 'react-router-dom'
import { Button, Badge } from '../../shared/ui'
import { OnboardingLayout } from './OnboardingLayout'

type ChannelOption = {
  type: string
  name: string
  available: boolean
}

const CHANNELS: ChannelOption[] = [
  { type: 'telegram', name: 'Telegram', available: true },
  { type: 'whatsapp', name: 'WhatsApp', available: false },
  { type: 'email', name: 'Email', available: false },
]

export function Step2Channel() {
  const navigate = useNavigate()

  function handleConnect(channelType: string) {
    // I3 is BLOCKED: config payload for channel connection is not yet defined.
    // Show a placeholder alert until the API contract is finalized.
    void channelType
    alert('Подключение канала пока недоступно. Функция в разработке.')
  }

  return (
    <OnboardingLayout step={2}>
      <h2>Подключите канал связи</h2>
      <p className="hint">
        Выберите мессенджер, через который ваш ассистент будет общаться с клиентами.
      </p>

      <div className="channel-list">
        {CHANNELS.map((channel) => (
          <div key={channel.type} className="channel-card">
            <div className="channel-info">
              <span className="channel-name">{channel.name}</span>
              {!channel.available && <Badge variant="soon">Скоро</Badge>}
            </div>
            <div className="channel-actions">
              {channel.available ? (
                <Button
                  variant="secondary"
                  size="small"
                  onClick={() => handleConnect(channel.type)}
                >
                  Подключить
                </Button>
              ) : (
                <Button variant="secondary" size="small" disabled>
                  Скоро
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="form-actions flex-between mt-16">
        <button
          type="button"
          className="btn btn--link"
          onClick={() => navigate('/onboarding/1')}
        >
          ← Назад
        </button>
        <Button onClick={() => navigate('/onboarding/3')}>
          Далее →
        </Button>
      </div>
    </OnboardingLayout>
  )
}
