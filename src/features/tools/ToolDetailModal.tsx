import type { components } from '../../api/generated/schema'
import { Modal, Button } from '../../shared/ui'

type ToolCatalogItem = components['schemas']['ToolCatalogItem']

type ToolDetailModalProps = {
  tool: ToolCatalogItem | null
  isInstalled: boolean
  onClose: () => void
  onConnect?: (toolId: string) => void
}

export function ToolDetailModal({ tool, isInstalled, onClose, onConnect }: ToolDetailModalProps) {
  if (!tool) return null

  const footerClass = `skill-detail-modal-footer ${
    isInstalled ? 'skill-detail-modal-footer--installed' : 'skill-detail-modal-footer--marketplace'
  }`

  return (
    <Modal
      open={!!tool}
      onClose={onClose}
      title={tool.name}
      className="skill-detail-modal"
      footer={
        <div className={footerClass}>
          {!isInstalled && onConnect && (
            <Button onClick={() => onConnect(tool.id)}>
              Подключить
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      }
    >
      <div className="skill-detail-content">
        <p>{tool.description}</p>
      </div>
    </Modal>
  )
}
