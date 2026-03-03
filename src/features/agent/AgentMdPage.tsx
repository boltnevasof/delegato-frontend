import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getAgent, updateAgentMd, enhance, getTaskStatus } from '../../api/agents'
import { Spinner, ErrorBanner } from '../../shared/ui'
import { DashboardEmpty } from '../dashboard/DashboardEmpty'
import { EditorForm } from './EditorForm'

export function AgentMdPage() {
  const queryClient = useQueryClient()

  const { data: agent, isLoading, error, refetch } = useQuery({
    queryKey: ['agent'],
    queryFn: getAgent,
  })

  async function handleSave(content: string) {
    await updateAgentMd(content)
    queryClient.invalidateQueries({ queryKey: ['agent'] })
  }

  async function handleEnhance(content: string): Promise<string | null> {
    const response = await enhance('agent_md', content)
    const taskId = response.task_id

    while (true) {
      await new Promise((r) => setTimeout(r, 3000))
      const status = await getTaskStatus(taskId)
      if (status.status === 'completed') {
        queryClient.invalidateQueries({ queryKey: ['agent'] })
        return (status.result?.content as string) ?? null
      }
      if (status.status === 'failed') {
        throw new Error(status.error ?? 'Не удалось улучшить текст')
      }
    }
  }

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <Spinner />
      </div>
    )
  }

  if (error) {
    if ((error as { status?: number }).status === 404) {
      return <DashboardEmpty />
    }
    return <ErrorBanner message={(error as { message?: string }).message ?? 'Ошибка загрузки'} onRetry={() => refetch()} />
  }

  return (
    <EditorForm
      title="Правила агента"
      content={agent?.agent_md ?? ''}
      onSave={handleSave}
      onEnhance={handleEnhance}
    />
  )
}
