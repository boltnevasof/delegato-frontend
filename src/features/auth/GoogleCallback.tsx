import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/hooks/useAuth'
import { getMe } from '../../api/users'
import { getOnboardingState } from '../../api/agents'
import { Spinner } from '../../shared/ui'

async function resolvePostLoginRoute(): Promise<string> {
  try {
    const user = await getMe()
    if (!user.subscription) return '/billing'

    try {
      const state = await getOnboardingState()
      if (!state.is_completed) return '/onboarding'
    } catch {
      // Если ошибка при загрузке onboarding state — пропускаем
    }

    return '/agent/settings'
  } catch {
    return '/billing'
  }
}

export function GoogleCallback() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    const params = new URLSearchParams(window.location.search)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token')

    // Strip tokens from URL to prevent leaks via browser history/referrer
    window.history.replaceState({}, '', window.location.pathname)

    if (!accessToken || !refreshToken) {
      navigate('/auth', { replace: true })
      return
    }

    login(accessToken, refreshToken)

    resolvePostLoginRoute()
      .then((route) => navigate(route, { replace: true }))
      .catch(() => navigate('/billing', { replace: true }))
  }, [login, navigate])

  return (
    <div className="page-wrap">
      <div className="auth-container" style={{ textAlign: 'center' }}>
        <Spinner />
        <p className="text-muted mt-16">Авторизация...</p>
      </div>
    </div>
  )
}
