import type { components } from '../../api/generated/schema'
import { Modal, Button } from '../../shared/ui'

type ToolCatalogItem = components['schemas']['ToolCatalogItem']

type ToolDetailModalProps = {
  tool: ToolCatalogItem | null
  onClose: () => void
}

export function ToolDetailModal({ tool, onClose }: ToolDetailModalProps) {
  if (!tool) return null

  return (
    <Modal
      open={!!tool}
      onClose={onClose}
      title={tool.name}
      footer={
        <Button variant="secondary" onClick={onClose}>
          Закрыть
        </Button>
      }
    >
      <p>{tool.description}</p>
    </Modal>
  )
}
