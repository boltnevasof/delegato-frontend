import type { components } from '../../api/generated/schema'
import { Button, Toggle } from '../../shared/ui'

type ToolCatalogItem = components['schemas']['ToolCatalogItem']

type ToolCardProps = {
  tool: ToolCatalogItem
  isInstalled: boolean
  isEnabled?: boolean
  agentToolId?: string
  onToggle?: (id: string, enabled: boolean) => void
  onConnect?: (toolId: string) => void
  onDisconnect?: (agentToolId: string) => void
  onDetail?: () => void
}

export function ToolCard({
  tool,
  isInstalled,
  isEnabled,
  agentToolId,
  onToggle,
  onConnect,
  onDisconnect,
  onDetail,
}: ToolCardProps) {
  return (
    <div className={`tool-card ${isInstalled ? 'added' : ''}`}>
      <div className="tool-card__header">
        <strong>{tool.name}</strong>
        {isInstalled && agentToolId && onToggle && (
          <Toggle
            checked={!!isEnabled}
            onChange={(checked) => onToggle(agentToolId, checked)}
          />
        )}
      </div>

      <p className="text-small text-muted">{tool.description}</p>

      <div className="tool-card__actions">
        <Button variant="ghost" size="small" onClick={onDetail}>
          Подробнее
        </Button>
        {isInstalled && agentToolId ? (
          <Button
            variant="danger"
            size="small"
            onClick={() => onDisconnect?.(agentToolId)}
          >
            Отключить
          </Button>
        ) : (
          <Button
            variant="primary"
            size="small"
            onClick={() => onConnect?.(tool.id)}
          >
            Подключить
          </Button>
        )}
      </div>
    </div>
  )
}
