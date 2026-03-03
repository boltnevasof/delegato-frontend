import type { components } from '../../api/generated/schema'
import { Modal, Button, Badge } from '../../shared/ui'

type SkillCatalogItem = components['schemas']['SkillCatalogItem']

type SkillDetailModalProps = {
  skill: SkillCatalogItem | null
  isInstalled: boolean
  onClose: () => void
  onConnect?: (skillId: string) => void
}

export function SkillDetailModal({ skill, isInstalled, onClose, onConnect }: SkillDetailModalProps) {
  if (!skill) return null

  const footerClass = `skill-detail-modal-footer ${
    isInstalled ? 'skill-detail-modal-footer--installed' : 'skill-detail-modal-footer--marketplace'
  }`

  return (
    <Modal
      open={!!skill}
      onClose={onClose}
      title={skill.name}
      className="skill-detail-modal"
      footer={
        <div className={footerClass}>
          {!isInstalled && skill.available_for_user && onConnect && (
            <Button onClick={() => onConnect(skill.id)}>
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
        <p>{skill.description}</p>
        <div className="mt-16">
          <span className="text-small text-muted">Уровень доступа: </span>
          <Badge variant="plan">{skill.access_level}</Badge>
        </div>
        {!skill.available_for_user && (
          <p className="text-small text-muted mt-16">
            Этот навык недоступен на вашем тарифе. Обновите подписку для доступа.
          </p>
        )}
      </div>
    </Modal>
  )
}
