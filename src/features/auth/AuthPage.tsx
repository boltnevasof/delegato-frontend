import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../../shared/hooks/useAuth'
import { useApiError } from '../../shared/hooks/useApiError'
import { sendOtp, verifyOtp, verifyTelegram, googleInitiateUrl } from '../../api/auth'
import { getMe } from '../../api/users'
import { getOnboardingState } from '../../api/agents'

import { Button, ErrorBanner } from '../../shared/ui'

declare global {
  interface Window {
    Telegram?: {
      Login: {
        auth: (
          options: { bot_id: string; request_access?: boolean },
          callback: (data: TelegramAuthData | false) => void,
        ) => void
      }
    }
  }
}

interface TelegramAuthData {
  id: number
  first_name: string
  last_name?: string
  username?: string
  photo_url?: string
  auth_date: number
  hash: string
}

async function resolvePostLoginRoute(): Promise<string> {
  try {
    const user = await getMe()
    if (!user.subscription) return '/choose-plan'

    try {
      const state = await getOnboardingState()
      if (!state.is_completed) return '/onboarding'
    } catch {
      // Если ошибка при загрузке onboarding state — пропускаем
    }

    return '/agent/settings'
  } catch {
    return '/choose-plan'
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

  useEffect(() => {
    if (document.getElementById('telegram-login-script')) return
    const script = document.createElement('script')
    script.id = 'telegram-login-script'
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    document.head.appendChild(script)
  }, [])

  const handleTelegramLogin = useCallback(() => {
    clearError()
    const botId = import.meta.env.VITE_TELEGRAM_BOT_ID
    if (!botId) {
      setError(new Error('Telegram bot не настроен'))
      return
    }
    if (!window.Telegram?.Login) {
      setError(new Error('Telegram виджет не загружен, попробуйте ещё раз'))
      return
    }
    window.Telegram.Login.auth(
      { bot_id: botId, request_access: true },
      async (data) => {
        if (!data) return
        setLoading(true)
        try {
          const tokens = await verifyTelegram({
            id: data.id,
            first_name: data.first_name,
            last_name: data.last_name ?? null,
            username: data.username ?? null,
            photo_url: data.photo_url ?? null,
            auth_date: data.auth_date,
            hash: data.hash,
          })
          login(tokens.access_token, tokens.refresh_token)
          setStep('success')
          const route = await resolvePostLoginRoute()
          navigate(route, { replace: true })
        } catch (err) {
          setError(err)
        } finally {
          setLoading(false)
        }
      },
    )
  }, [clearError, setError, login, navigate])

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

          <div className="auth-divider">или</div>

          <div className="auth-buttons">
            <button className="btn btn--large btn--oauth" onClick={handleTelegramLogin} style={{ width: '100%' }}>
              <svg width="20" height="20" viewBox="0 0 240 240" fill="none"><circle cx="120" cy="120" r="120" fill="#2AABEE"/><path d="M98 175c-3.9 0-3.2-1.5-4.6-5.2L82 132.2 170.4 78" fill="#C8DAEA"/><path d="M98 175c3 0 4.3-1.4 6-3l16-15.6-20-12" fill="#A9C9DD"/><path d="M100 144.4l48.4 35.7c5.5 3 9.5 1.5 10.9-5.1l19.7-92.8c2-8.1-3.1-11.7-8.4-9.3L55 117.5c-7.9 3.2-7.8 7.6-1.4 9.5l36.4 11.4 84.4-53.2c4-2.4 7.6-1.1 4.6 1.5" fill="#F6FBFE"/></svg>
              Войти через Telegram
            </button>
            <button className="btn btn--large btn--oauth" onClick={handleGoogleLogin} style={{ width: '100%' }}>
              <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09a6.06 6.06 0 0 1 0-4.17V7.07H2.18A10.01 10.01 0 0 0 2 12c0 1.61.39 3.14 1.07 4.5l3.77-2.41z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Войти через Google
            </button>
          </div>
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
