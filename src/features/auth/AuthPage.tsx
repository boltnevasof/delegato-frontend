import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../shared/hooks/useAuth'
import { useApiError } from '../../shared/hooks/useApiError'
import { sendOtp, verifyOtp, googleInitiateUrl } from '../../api/auth'
import { getMe } from '../../api/users'
import { getOnboardingState } from '../../api/agents'

import { Button, ErrorBanner } from '../../shared/ui'

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

type Step = 'methods' | 'code' | 'success'

export function AuthPage() {
  const [step, setStep] = useState<Step>('methods')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { error, setError, clearError } = useApiError()
  const { login } = useAuth()
  const navigate = useNavigate()

  const emailForm = useForm<{ email: string }>()
  const codeForm = useForm<{ code: string }>()

  const handleSendOtp = useCallback(async (data: { email: string }) => {
    setLoading(true)
    clearError()
    try {
      await sendOtp(data.email)
      setEmail(data.email)
      setStep('code')
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [clearError, setError])

  const handleVerifyOtp = useCallback(async (data: { code: string }) => {
    setLoading(true)
    clearError()
    try {
      const tokens = await verifyOtp(email, data.code)
      login(tokens.access_token, tokens.refresh_token)
      setStep('success')

      const route = await resolvePostLoginRoute()
      navigate(route, { replace: true })
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [email, login, navigate, clearError, setError])

  const handleGoogleLogin = () => {
    window.location.href = googleInitiateUrl()
  }

  return (
    <>
      <h1>Войти в Delegato</h1>
      <p className="subtitle">Создайте AI-ассистента за 5 минут</p>

      {error && <ErrorBanner message={error.message} onRetry={clearError} />}

      {step === 'methods' && (
        <>
          <div className="auth-buttons">
            <button className="btn btn--large" disabled style={{ width: '100%', opacity: 0.5 }}>
              Войти через Telegram (скоро)
            </button>
            <button className="btn btn--large" onClick={handleGoogleLogin} style={{ width: '100%' }}>
              Войти через Google
            </button>
          </div>

          <div className="auth-divider">или</div>

          <form onSubmit={emailForm.handleSubmit(handleSendOtp)}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label>Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="your@email.com"
                {...emailForm.register('email', { required: true })}
              />
            </div>
            <Button variant="primary" type="submit" loading={loading} loadingText="Отправляем код..." style={{ width: '100%' }}>
              Отправить код
            </Button>
          </form>
        </>
      )}

      {step === 'code' && (
        <>
          <p style={{ marginBottom: 20 }}>
            Код отправлен на <strong>{email}</strong>
          </p>
          <form onSubmit={codeForm.handleSubmit(handleVerifyOtp)}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label>Введите код</label>
              <input
                type="text"
                className="form-input"
                placeholder="123456"
                maxLength={6}
                {...codeForm.register('code', { required: true, minLength: 6 })}
              />
            </div>
            <Button variant="primary" type="submit" loading={loading} loadingText="Проверяем код..." style={{ width: '100%' }}>
              Войти
            </Button>
          </form>
          <p className="text-muted mt-16">
            <a href="#" onClick={(e) => { e.preventDefault(); setStep('methods'); clearError() }}>
              Другой способ входа
            </a>
          </p>
        </>
      )}

      {step === 'success' && (
        <div style={{ textAlign: 'center' }}>
          <div className="styled-indicator styled-indicator--success">{'\u2713'}</div>
          <h2>Вы вошли!</h2>
          <p className="text-muted">Перенаправляем...</p>
        </div>
      )}
    </>
  )
}
