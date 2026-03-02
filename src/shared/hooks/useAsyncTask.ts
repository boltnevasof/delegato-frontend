import { useQuery } from '@tanstack/react-query'
import { getTaskStatus } from '../../api/agents'

type AsyncTaskResult = {
  status: string
  result: Record<string, unknown> | null
  error: string | null
  isPolling: boolean
}

export function useAsyncTask(taskId: string | null): AsyncTaskResult {
  // Per I2 decision: null task_id = operation completed successfully
  const { data, error } = useQuery({
    queryKey: ['asyncTask', taskId],
    queryFn: () => getTaskStatus(taskId!),
    enabled: taskId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if (status === 'completed' || status === 'failed') return false
      return 3000 // Poll every 3 seconds
    },
    refetchIntervalInBackground: false,
    staleTime: 0,
  })

  if (taskId === null) {
    return { status: 'completed', result: null, error: null, isPolling: false }
  }

  if (error) {
    return {
      status: 'failed',
      result: null,
      error: (error as { message?: string }).message || 'Task polling failed',
      isPolling: false,
    }
  }

  return {
    status: data?.status ?? 'pending',
    result: data?.result ?? null,
    error: data?.error ?? null,
    isPolling: data?.status !== 'completed' && data?.status !== 'failed',
  }
}
