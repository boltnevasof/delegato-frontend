import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAgent } from '../../api/agents'
import { getCatalog, toggleTool, removeTool } from '../../api/tools'
import { useApiError } from '../../shared/hooks/useApiError'
import { ErrorBanner, Spinner } from '../../shared/ui'
import { DashboardEmpty } from '../dashboard/DashboardEmpty'
import { ToolCard } from './ToolCard'
import { ToolDetailModal } from './ToolDetailModal'
import { ToolConnectModal } from './ToolConnectModal'
import type { components } from '../../api/generated/schema'

type ToolCatalogItem = components['schemas']['ToolCatalogItem']

export function ToolsPage() {
  const queryClient = useQueryClient()
  const { error, setError, clearError } = useApiError()
  const [detailTool, setDetailTool] = useState<ToolCatalogItem | null>(null)
  const [connectTool, setConnectTool] = useState<ToolCatalogItem | null>(null)

  const agentQuery = useQuery({ queryKey: ['agent'], queryFn: getAgent })
  const catalogQuery = useQuery({ queryKey: ['toolCatalog'], queryFn: getCatalog })

  const agent = agentQuery.data
  const catalog = catalogQuery.data

  const installedSlugs = new Set(agent?.tools.map((t) => t.slug) ?? [])

  async function handleToggle(agentToolId: string, enabled: boolean) {
    clearError()
    try {
      await toggleTool(agentToolId, enabled)
      queryClient.invalidateQueries({ queryKey: ['agent'] })
    } catch (err) {
      setError(err)
    }
  }

  async function handleDisconnect(agentToolId: string) {
    clearError()
    try {
      await removeTool(agentToolId)
      queryClient.invalidateQueries({ queryKey: ['agent'] })
    } catch (err) {
      setError(err)
    }
  }

  function handleConnected() {
    queryClient.invalidateQueries({ queryKey: ['agent'] })
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

  const installedTools = catalog?.tools.filter((t) => installedSlugs.has(t.slug)) ?? []
  const availableTools = catalog?.tools.filter((t) => !installedSlugs.has(t.slug)) ?? []

  function findAgentTool(catalogSlug: string) {
    return agent?.tools.find((t) => t.slug === catalogSlug)
  }

  return (
    <div className="page-wrap">
      <h1>Инструменты</h1>

      {error && <ErrorBanner message={error.message} />}

      <h2>Подключённые</h2>
      {installedTools.length === 0 ? (
        <p className="text-muted">У вас пока нет подключённых инструментов</p>
      ) : (
        <div className="tool-grid">
          {installedTools.map((tool) => {
            const agentTool = findAgentTool(tool.slug)
            return (
              <ToolCard
                key={tool.id}
                tool={tool}
                isInstalled
                isEnabled={agentTool?.is_enabled}
                agentToolId={agentTool?.id}
                onToggle={handleToggle}
                onDisconnect={handleDisconnect}
                onDetail={() => setDetailTool(tool)}
              />
            )
          })}
        </div>
      )}

      <h2 className="mt-32">Доступные инструменты</h2>
      <div className="tool-grid">
        {availableTools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            isInstalled={false}
            onConnect={() => setConnectTool(tool)}
            onDetail={() => setDetailTool(tool)}
          />
        ))}
      </div>

      <ToolDetailModal
        tool={detailTool}
        onClose={() => setDetailTool(null)}
      />

      <ToolConnectModal
        tool={connectTool}
        onClose={() => setConnectTool(null)}
        onConnected={handleConnected}
      />
    </div>
  )
}
