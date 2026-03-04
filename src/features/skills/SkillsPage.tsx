import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAgent } from '../../api/agents'
import { getCatalog, addSkill, removeSkill } from '../../api/skills'
import { useApiError } from '../../shared/hooks/useApiError'
import { Button, ErrorBanner, Spinner } from '../../shared/ui'
import { DashboardEmpty } from '../dashboard/DashboardEmpty'
import { SkillCard } from './SkillCard'
import { SkillDetailModal } from './SkillDetailModal'
import type { components } from '../../api/generated/schema'

type SkillCatalogItem = components['schemas']['SkillCatalogItem']
type SkillTab = 'installed' | 'marketplace'

const PAGE_SIZE = 6

export function SkillsPage() {
  const queryClient = useQueryClient()
  const { error, setError, clearError } = useApiError()
  const [detailSkill, setDetailSkill] = useState<SkillCatalogItem | null>(null)
  const [activeTab, setActiveTab] = useState<SkillTab>('installed')
  const [page, setPage] = useState(1)

  const agentQuery = useQuery({ queryKey: ['agent'], queryFn: getAgent })
  const catalogQuery = useQuery({ queryKey: ['skillCatalog'], queryFn: getCatalog })

  const agent = agentQuery.data
  const catalog = catalogQuery.data

  const installedSlugs = new Set(agent?.skills.map((s) => s.slug) ?? [])

  async function handleConnect(skillId: string) {
    clearError()
    try {
      await addSkill(skillId)
      queryClient.invalidateQueries({ queryKey: ['agent'] })
    } catch (err) {
      setError(err)
    }
  }
  async function handleDisconnect(agentSkillId: string) {
    clearError()
    try {
      await removeSkill(agentSkillId)
      queryClient.invalidateQueries({ queryKey: ['agent'] })
    } catch (err) {
      setError(err)
    }
  }

  if (agentQuery.isLoading || catalogQuery.isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Spinner />
      </div>
    )
  }

  if (agentQuery.error) {
    if ((agentQuery.error as { status?: number }).status === 404) {
      return <DashboardEmpty />
    }
    return (
      <ErrorBanner
        message={(agentQuery.error as { message?: string })?.message ?? 'Не удалось загрузить данные'}
        onRetry={() => agentQuery.refetch()}
      />
    )
  }

  if (catalogQuery.error) {
    return (
      <ErrorBanner
        message={(catalogQuery.error as { message?: string })?.message ?? 'Не удалось загрузить каталог'}
        onRetry={() => catalogQuery.refetch()}
      />
    )
  }

  const installedSkills = catalog?.skills.filter((s) => installedSlugs.has(s.slug)) ?? []
  const availableSkills = catalog?.skills.filter((s) => !installedSlugs.has(s.slug)) ?? []

  const currentItems = activeTab === 'installed' ? installedSkills : availableSkills
  const totalPages = Math.max(1, Math.ceil(currentItems.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)

  const start = (safePage - 1) * PAGE_SIZE
  const paginatedItems = currentItems.slice(start, start + PAGE_SIZE)

  function changeTab(tab: SkillTab) {
    setActiveTab(tab)
    setPage(1)
  }

  function findAgentSkill(catalogSlug: string) {
    return agent?.skills.find((s) => s.slug === catalogSlug)
  }

  return (
    <div className="page-wrap page-wrap--wide skills-marketplace-page">
      <h1>Задачи и скиллы</h1>

      {error && <ErrorBanner message={error.message} />}

      <div className="marketplace-tabs" role="tablist" aria-label="Фильтр навыков">
        <button
          type="button"
          className={`marketplace-tab ${activeTab === 'installed' ? 'active' : ''}`}
          onClick={() => changeTab('installed')}
        >
          Установленные ({installedSkills.length})
        </button>
        <button
          type="button"
          className={`marketplace-tab ${activeTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => changeTab('marketplace')}
        >
          Маркетплейс ({availableSkills.length})
        </button>
      </div>

      {currentItems.length === 0 ? (
        <p className="text-muted mt-16">
          {activeTab === 'installed'
            ? 'У вас пока нет установленных скиллов.'
            : 'Все доступные скиллы уже установлены.'}
        </p>
      ) : (
        <div className="marketplace-plugin-grid">
          {paginatedItems.map((skill) => {
            const agentSkill = findAgentSkill(skill.slug)
            return (
              <SkillCard
                key={skill.id}
                skill={skill}
                isInstalled={activeTab === 'installed'}
                agentSkillId={agentSkill?.id}
                onDisconnect={handleDisconnect}
                onConnect={handleConnect}
                onDetail={() => setDetailSkill(skill)}
              />
            )
          })}
        </div>
      )}

      {currentItems.length > PAGE_SIZE && (
        <div className="marketplace-pagination">
          <Button
            variant="secondary"
            size="small"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Назад
          </Button>
          <span className="text-muted">Страница {safePage} из {totalPages}</span>
          <Button
            variant="secondary"
            size="small"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Далее
          </Button>
        </div>
      )}

      <SkillDetailModal
        skill={detailSkill}
        isInstalled={detailSkill ? installedSlugs.has(detailSkill.slug) : false}
        onClose={() => setDetailSkill(null)}
        onConnect={handleConnect}
      />
    </div>
  )
}
