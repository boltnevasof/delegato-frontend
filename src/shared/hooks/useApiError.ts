import { useState, useCallback } from 'react'

type ApiErrorState = {
  message: string
  status?: number
  fieldErrors?: Array<{ loc: (string | number)[]; msg: string }>
}

export function useApiError() {
  const [error, setErrorState] = useState<ApiErrorState | null>(null)

  const setError = useCallback((err: unknown) => {
    if (err && typeof err === 'object') {
      const e = err as {
        status?: number
        message?: string
        detail?: Array<{ loc: (string | number)[]; msg: string }>
      }

      // 429 rate limit
      if (e.status === 429) {
        setErrorState({ message: 'Too many attempts, try again later', status: 429 })
        return
      }

      // 422 validation errors
      if (e.status === 422 && e.detail) {
        setErrorState({
          message: e.detail.map(d => d.msg).join('; '),
          status: 422,
          fieldErrors: e.detail,
        })
        return
      }

      setErrorState({
        message: e.message || 'An error occurred',
        status: e.status,
      })
      return
    }

    setErrorState({ message: 'An unexpected error occurred' })
  }, [])

  const clearError = useCallback(() => setErrorState(null), [])

  return { error, setError, clearError }
}
