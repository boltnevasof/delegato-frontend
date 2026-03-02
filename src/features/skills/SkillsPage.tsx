import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAgent } from '../../api/agents'
import { getCatalog, addSkill, toggleSkill, removeSkill } from '../../api/skills'
import { useApiError } from '../../shared/hooks/useApiError'
import { ErrorBanner, Spinner } from '../../shared/ui'
import { DashboardEmpty } from '../dashboard/DashboardEmpty'
import { SkillCard } from './SkillCard'
import { SkillDetailModal } from './SkillDetailModal'
import type { components } from '../../api/generated/schema'

type SkillCatalogItem = components['schemas']['SkillCatalogItem']

export function SkillsPage() {
  const queryClient = useQueryClient()
  const { error, setError, clearError } = useApiError()
  const [detailSkill, setDetailSkill] = useState<SkillCatalogItem | null>(null)

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

  async function handleToggle(agentSkillId: string, enabled: boolean) {
    clearError()
    try {
      await toggleSkill(agentSkillId, enabled)
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

  function findAgentSkill(catalogSlug: string) {
    return agent?.skills.find((s) => s.slug === catalogSlug)
  }

  return (
    <div className="page-wrap">
      <h1>Задачи и скиллы</h1>

      {error && <ErrorBanner message={error.message} />}

      <h2>Подключённые</h2>
      {installedSkills.length === 0 ? (
        <p className="text-muted">У вас пока нет подключённых навыков</p>
      ) : (
        <div className="skill-grid">
          {installedSkills.map((skill) => {
            const agentSkill = findAgentSkill(skill.slug)
            return (
              <SkillCard
                key={skill.id}
                skill={skill}
                isInstalled
                isEnabled={agentSkill?.is_enabled}
                agentSkillId={agentSkill?.id}
                onToggle={handleToggle}
                onDisconnect={handleDisconnect}
                onDetail={() => setDetailSkill(skill)}
              />
            )
          })}
        </div>
      )}

      <h2 className="mt-32">Маркетплейс навыков</h2>
      <div className="skill-grid">
        {availableSkills.map((skill) => (
          <SkillCard
            key={skill.id}
            skill={skill}
            isInstalled={false}
            onConnect={handleConnect}
            onDetail={() => setDetailSkill(skill)}
          />
        ))}
      </div>

      <SkillDetailModal
        skill={detailSkill}
        isInstalled={detailSkill ? installedSlugs.has(detailSkill.slug) : false}
        onClose={() => setDetailSkill(null)}
        onConnect={handleConnect}
      />
    </div>
  )
}
