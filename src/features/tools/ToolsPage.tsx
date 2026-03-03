import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAgent } from '../../api/agents'
import { getCatalog, addTool, toggleTool, removeTool } from '../../api/tools'
import { useApiError } from '../../shared/hooks/useApiError'
import { Button, ErrorBanner, Spinner } from '../../shared/ui'
import { DashboardEmpty } from '../dashboard/DashboardEmpty'
import { ToolCard } from './ToolCard'
import { ToolDetailModal } from './ToolDetailModal'
import type { components } from '../../api/generated/schema'

type ToolCatalogItem = components['schemas']['ToolCatalogItem']
type ToolTab = 'installed' | 'marketplace'

const PAGE_SIZE = 6

export function ToolsPage() {
  const queryClient = useQueryClient()
  const { error, setError, clearError } = useApiError()
  const [detailTool, setDetailTool] = useState<ToolCatalogItem | null>(null)
  const [activeTab, setActiveTab] = useState<ToolTab>('installed')
  const [page, setPage] = useState(1)

  const agentQuery = useQuery({ queryKey: ['agent'], queryFn: getAgent })
  const catalogQuery = useQuery({ queryKey: ['toolCatalog'], queryFn: getCatalog })

  const agent = agentQuery.data
  const catalog = catalogQuery.data

  const installedSlugs = new Set(agent?.tools.map((t) => t.slug) ?? [])

  async function handleConnect(toolId: string) {
    clearError()
    try {
      await addTool(toolId)
      queryClient.invalidateQueries({ queryKey: ['agent'] })
    } catch (err) {
      setError(err)
    }
  }

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
  const currentItems = activeTab === 'installed' ? installedTools : availableTools
  const totalPages = Math.max(1, Math.ceil(currentItems.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * PAGE_SIZE
  const paginatedItems = currentItems.slice(start, start + PAGE_SIZE)

  function changeTab(tab: ToolTab) {
    setActiveTab(tab)
    setPage(1)
  }

  function findAgentTool(catalogSlug: string) {
    return agent?.tools.find((t) => t.slug === catalogSlug)
  }

  return (
    <div className="page-wrap page-wrap--wide skills-marketplace-page">
      <h1>Инструменты</h1>

      {error && <ErrorBanner message={error.message} />}

      <div className="marketplace-tabs" role="tablist" aria-label="Фильтр инструментов">
        <button
          type="button"
          className={`marketplace-tab ${activeTab === 'installed' ? 'active' : ''}`}
          onClick={() => changeTab('installed')}
        >
          Установленные ({installedTools.length})
        </button>
        <button
          type="button"
          className={`marketplace-tab ${activeTab === 'marketplace' ? 'active' : ''}`}
          onClick={() => changeTab('marketplace')}
        >
          Маркетплейс ({availableTools.length})
        </button>
      </div>

      {currentItems.length === 0 ? (
        <p className="text-muted mt-16">
          {activeTab === 'installed'
            ? 'У вас пока нет подключённых инструментов.'
            : 'Все доступные инструменты уже установлены.'}
        </p>
      ) : (
        <div className="marketplace-plugin-grid">
          {paginatedItems.map((tool) => {
            const agentTool = findAgentTool(tool.slug)
            return (
              <ToolCard
                key={tool.id}
                tool={tool}
                isInstalled={activeTab === 'installed'}
                isEnabled={agentTool?.is_enabled}
                agentToolId={agentTool?.id}
                onToggle={handleToggle}
                onDisconnect={handleDisconnect}
                onConnect={handleConnect}
                onDetail={() => setDetailTool(tool)}
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

      <ToolDetailModal
        tool={detailTool}
        isInstalled={detailTool ? installedSlugs.has(detailTool.slug) : false}
        onClose={() => setDetailTool(null)}
        onConnect={handleConnect}
      />
    </div>
  )
}
