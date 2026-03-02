import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getCatalog } from '../../api/tools'
import { addTool } from '../../api/tools'
import { useApiError } from '../../shared/hooks/useApiError'
import { Button, Modal, ErrorBanner, Spinner } from '../../shared/ui'
import { OnboardingLayout } from './OnboardingLayout'
import type { components } from '../../api/generated/schema'

type ToolCatalogItem = components['schemas']['ToolCatalogItem']

export function Step4Tools() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { error, setError, clearError } = useApiError()
  const [connectingTool, setConnectingTool] = useState<ToolCatalogItem | null>(null)
  const [connecting, setConnecting] = useState(false)
  const [connectedIds, setConnectedIds] = useState<Set<string>>(new Set())

  const { data, isLoading } = useQuery({
    queryKey: ['toolCatalog'],
    queryFn: getCatalog,
  })

  async function handleConnect() {
    if (!connectingTool) return
    clearError()
    setConnecting(true)
    try {
      await addTool(connectingTool.id)
      setConnectedIds((prev) => new Set(prev).add(connectingTool.id))
      setConnectingTool(null)
      queryClient.invalidateQueries({ queryKey: ['agent'] })
    } catch (err) {
      setError(err)
    } finally {
      setConnecting(false)
    }
  }

  return (
    <OnboardingLayout step={4}>
      <h2>Подключите инструменты</h2>
      <p className="hint">Выберите сервисы, с которыми будет работать ваш ассистент.</p>

      {error && <ErrorBanner message={error.message} />}

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem 0' }}>
          <Spinner />
        </div>
      ) : (
        <div className="tool-grid">
          {data?.tools.map((tool) => {
            const isConnected = connectedIds.has(tool.id)
            return (
              <div key={tool.id} className="tool-card">
                <div className="tool-card__header">
                  <strong>{tool.name}</strong>
                </div>
                <p className="text-small text-muted">{tool.description}</p>
                <div className="tool-card__actions">
                  {isConnected ? (
                    <Button variant="secondary" size="small" disabled>
                      Подключено
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="small"
                      onClick={() => setConnectingTool(tool)}
                    >
                      Подключить
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="form-actions flex-between mt-16">
        <button
          type="button"
          className="btn btn--link"
          onClick={() => navigate('/onboarding/3')}
        >
          &larr; Назад
        </button>
        <Button onClick={() => navigate('/onboarding/5')}>
          Далее &rarr;
        </Button>
      </div>

      <Modal
        open={connectingTool !== null}
        onClose={() => setConnectingTool(null)}
        title={`Подключить ${connectingTool?.name ?? ''}`}
        footer={
          <>
            <Button variant="secondary" onClick={() => setConnectingTool(null)}>
              Отмена
            </Button>
            <Button loading={connecting} onClick={handleConnect}>
              Подтвердить
            </Button>
          </>
        }
      >
        <p>Вы хотите подключить инструмент <strong>{connectingTool?.name}</strong>?</p>
        <p className="text-small text-muted">{connectingTool?.description}</p>
      </Modal>
    </OnboardingLayout>
  )
}
