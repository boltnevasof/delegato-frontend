import type { KeyboardEvent } from 'react'
import type { components } from '../../api/generated/schema'
import { Button, Badge, Toggle } from '../../shared/ui'

type SkillCatalogItem = components['schemas']['SkillCatalogItem']

type SkillCardProps = {
  skill: SkillCatalogItem
  isInstalled: boolean
  isEnabled?: boolean
  agentSkillId?: string
  onToggle?: (id: string, enabled: boolean) => void
  onConnect?: (skillId: string) => void
  onDisconnect?: (agentSkillId: string) => void
  onDetail?: () => void
}

function getInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase()
}

export function SkillCard({
  skill,
  isInstalled,
  isEnabled,
  agentSkillId,
  onToggle,
  onConnect,
  onDisconnect,
  onDetail,
}: SkillCardProps) {
  const classes = [
    'marketplace-plugin-card',
    isInstalled && 'installed',
    !skill.available_for_user && 'disabled',
  ]
    .filter(Boolean)
    .join(' ')

  function openDetailByKeyboard(e: KeyboardEvent<HTMLDivElement>) {
    if ((e.key === 'Enter' || e.key === ' ') && onDetail) {
      e.preventDefault()
      onDetail()
    }
  }

  return (
    <div
      className={classes}
      onClick={onDetail}
      onKeyDown={openDetailByKeyboard}
      role="button"
      tabIndex={0}
      aria-label={`Открыть детали навыка ${skill.name}`}
    >
      <div className="marketplace-plugin-logo" aria-hidden="true">
        <span>{getInitials(skill.name)}</span>
      </div>

      <div className="marketplace-plugin-main">
        <div className="marketplace-plugin-head">
          <h3>{skill.name}</h3>
          <div className="marketplace-plugin-right">
            <Badge variant="plan">{skill.access_level}</Badge>
            {isInstalled && agentSkillId && onToggle && (
              <div onClick={(e) => e.stopPropagation()}>
                <Toggle
                  checked={!!isEnabled}
                  onChange={(checked) => onToggle(agentSkillId, checked)}
                />
              </div>
            )}
          </div>
        </div>

        <p>{skill.description}</p>

        <div className="marketplace-plugin-actions" onClick={(e) => e.stopPropagation()}>
          {isInstalled && agentSkillId ? (
            <Button
              variant="danger"
              size="small"
              onClick={() => onDisconnect?.(agentSkillId)}
            >
              Отключить
            </Button>
          ) : (
            <Button
              variant="primary"
              size="small"
              disabled={!skill.available_for_user}
              onClick={() => onConnect?.(skill.id)}
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
