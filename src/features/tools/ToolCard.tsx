import type { KeyboardEvent } from 'react'
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

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase()
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
  function openDetailByKeyboard(e: KeyboardEvent<HTMLDivElement>) {
    if ((e.key === 'Enter' || e.key === ' ') && onDetail) {
      e.preventDefault()
      onDetail()
    }
  }

  return (
    <div
      className={`marketplace-plugin-card ${isInstalled ? 'installed' : ''}`}
      onClick={onDetail}
      onKeyDown={openDetailByKeyboard}
      role="button"
      tabIndex={0}
      aria-label={`Открыть детали инструмента ${tool.name}`}
    >
      <div className="marketplace-plugin-logo" aria-hidden="true">
        <span>{getInitials(tool.name)}</span>
      </div>

      <div className="marketplace-plugin-main">
        <div className="marketplace-plugin-head">
          <h3>{tool.name}</h3>
          <div className="marketplace-plugin-right">
            {isInstalled && agentToolId && onToggle && (
              <div onClick={(e) => e.stopPropagation()}>
                <Toggle
                  checked={!!isEnabled}
                  onChange={(checked) => onToggle(agentToolId, checked)}
                />
              </div>
            )}
          </div>
        </div>

        <p>{tool.description}</p>

        <div className="marketplace-plugin-actions" onClick={(e) => e.stopPropagation()}>
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
          <Button variant="secondary" size="small" onClick={onDetail}>
            Подробнее
          </Button>
        </div>
      </div>
    </div>
  )
}
