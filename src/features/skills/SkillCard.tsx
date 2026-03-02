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
    'skill-card',
    isInstalled && 'added',
    !skill.available_for_user && 'disabled',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <div className="skill-card__header">
        <h4>{skill.name}</h4>
        {!skill.available_for_user && (
          <Badge variant="plan">{skill.access_level}</Badge>
        )}
        {isInstalled && agentSkillId && onToggle && (
          <Toggle
            checked={!!isEnabled}
            onChange={(checked) => onToggle(agentSkillId, checked)}
          />
        )}
      </div>

      <p className="text-small text-muted">{skill.description}</p>

      <div className="skill-card__actions">
        <Button variant="ghost" size="small" onClick={onDetail}>
          Подробнее
        </Button>
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
      </div>
    </div>
  )
}
