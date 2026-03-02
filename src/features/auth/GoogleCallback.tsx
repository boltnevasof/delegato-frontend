import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../shared/hooks/useAuth'
import { getMe } from '../../api/users'
import { Spinner } from '../../shared/ui'

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

    getMe()
      .then((user) => {
        if (!user.subscription) {
          navigate('/pricing', { replace: true })
        } else if (user.agent && user.agent.onboarding_step > 0 && user.agent.onboarding_step <= 5) {
          navigate(`/onboarding/${user.agent.onboarding_step}`, { replace: true })
        } else {
          navigate('/dashboard', { replace: true })
        }
      })
      .catch(() => {
        navigate('/dashboard', { replace: true })
      })
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
