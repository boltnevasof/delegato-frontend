import type { components } from './generated/schema'

type ApiError = {
  status: number
  message: string
  detail?: components['schemas']['ValidationError'][]
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

// Token storage — persisted in localStorage so sessions survive tab close
let accessToken: string | null = localStorage.getItem('access_token')
let refreshToken: string | null = localStorage.getItem('refresh_token')

// Refresh mutex: prevent concurrent refresh attempts
let refreshPromise: Promise<boolean> | null = null

export function setTokens(access: string, refresh: string): void {
  accessToken = access
  refreshToken = refresh
  localStorage.setItem('access_token', access)
  localStorage.setItem('refresh_token', refresh)
}

export function clearTokens(): void {
  accessToken = null
  refreshToken = null
  localStorage.removeItem('access_token')
  localStorage.removeItem('refresh_token')
}

export function getAccessToken(): string | null {
  return accessToken
}

export function getRefreshToken(): string | null {
  return refreshToken
}

export function isAuthenticated(): boolean {
  return accessToken !== null
}

async function attemptRefresh(): Promise<boolean> {
  if (!refreshToken) return false

  // Mutex: if a refresh is already in-flight, wait for it
  if (refreshPromise) {
    return refreshPromise
  }

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${BASE_URL}/auth/token/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!res.ok) {
        clearTokens()
        return false
      }

      const data = await res.json()
      setTokens(data.access_token, data.refresh_token)
      return true
    } catch {
      clearTokens()
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  // Handle 401: attempt refresh
  if (res.status === 401 && refreshToken) {
    const refreshed = await attemptRefresh()
    if (refreshed) {
      // Retry original request with new token
      headers['Authorization'] = `Bearer ${accessToken}`
      const retryRes = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
      })
      if (!retryRes.ok) {
        throw await parseError(retryRes)
      }
      if (retryRes.status === 204) return undefined as T
      return retryRes.json()
    } else {
      // Refresh failed — redirect to auth
      window.location.href = '/auth'
      throw { status: 401, message: 'Session expired' } satisfies ApiError
    }
  }

  // Handle 429: rate limit
  if (res.status === 429) {
    throw {
      status: 429,
      message: 'Too many attempts, try again later',
    } satisfies ApiError
  }

  if (!res.ok) {
    throw await parseError(res)
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

async function parseError(res: Response): Promise<ApiError> {
  try {
    const body = await res.json()
    if (body.detail && Array.isArray(body.detail)) {
      return {
        status: res.status,
        message: body.detail.map((d: { msg: string }) => d.msg).join('; '),
        detail: body.detail,
      }
    }
    return {
      status: res.status,
      message: body.message || body.detail || `Error ${res.status}`,
    }
  } catch {
    return {
      status: res.status,
      message: `Error ${res.status}`,
    }
  }
}
