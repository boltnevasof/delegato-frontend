import { useState } from 'react'
import type { components } from '../../api/generated/schema'
import { addTool } from '../../api/tools'
import { Modal, Button, ErrorBanner } from '../../shared/ui'
import { useApiError } from '../../shared/hooks/useApiError'

type ToolCatalogItem = components['schemas']['ToolCatalogItem']

type ToolConnectModalProps = {
  tool: ToolCatalogItem | null
  onClose: () => void
  onConnected: () => void
}

export function ToolConnectModal({ tool, onClose, onConnected }: ToolConnectModalProps) {
  const { error, setError, clearError } = useApiError()
  const [connecting, setConnecting] = useState(false)

  async function handleConfirm() {
    if (!tool) return
    clearError()
    setConnecting(true)
    try {
      await addTool(tool.id)
      onConnected()
      onClose()
    } catch (err) {
      setError(err)
    } finally {
      setConnecting(false)
    }
  }

  if (!tool) return null

  return (
    <Modal
      open={!!tool}
      onClose={onClose}
      title={`Подключить ${tool.name}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={connecting}>
            Отмена
          </Button>
          <Button loading={connecting} onClick={handleConfirm}>
            Подтвердить
          </Button>
        </>
      }
    >
      {error && <ErrorBanner message={error.message} />}
      <p>Вы хотите подключить инструмент <strong>{tool.name}</strong> к вашему агенту?</p>
      <p className="text-small text-muted">{tool.description}</p>
    </Modal>
  )
}
