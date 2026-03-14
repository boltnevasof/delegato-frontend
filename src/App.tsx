import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useAuth } from './shared/hooks/useAuth'
import { getMe } from './api/users'
import { getOnboardingState } from './api/agents'
import { DashboardLayout } from './shared/layouts/DashboardLayout'
import { AuthLayout } from './shared/layouts/AuthLayout'
import { AgentSettingsPage } from './features/agent/AgentSettingsPage'
import { SkillsPage } from './features/skills/SkillsPage'
import { ToolsPage } from './features/tools/ToolsPage'
import { ChannelPage } from './features/channels/ChannelPage'
import { SubscriptionPage } from './features/billing/SubscriptionPage'
import { ChoosePlanPage } from './features/billing/ChoosePlanPage'
import { SupportPage } from './features/support/SupportPage'
import { AdminPage } from './features/admin/AdminPage'
import { AdminUserDetailPage } from './features/admin/AdminUserDetailPage'
import { AuthPage } from './features/auth/AuthPage'
import { GoogleCallback } from './features/auth/GoogleCallback'
import { NewOnboardingPage } from './features/onboarding/NewOnboardingPage'
import { Spinner } from './shared/ui'

function ProtectedRoute() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/auth" replace />
  return <Outlet />
}

function GuestRoute() {
  const { isAuthenticated } = useAuth()
  if (isAuthenticated) return <Navigate to="/agent/settings" replace />
  return <Outlet />
}

/** Единый гард для всех авторизованных маршрутов.
 *  - Нет подписки → только /billing и /support
 *  - Есть подписка, onboarding не пройден → /onboarding
 *  - Всё ок → пропускаем */
function AppGuard() {
  const location = useLocation()
  const { data: user, isLoading: userLoading, isError: userError } = useQuery({
    queryKey: ['userProfile'],
    queryFn: getMe,
    staleTime: 30_000,
  })

  const hasSubscription = !!user?.subscription
  const { data: onboarding, isLoading: onboardingLoading } = useQuery({
    queryKey: ['onboardingState'],
    queryFn: getOnboardingState,
    staleTime: 30_000,
    enabled: hasSubscription,
  })

  const isLoading = userLoading || (hasSubscription && onboardingLoading)

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <Spinner />
      </div>
    )
  }

  if (userError) return <Outlet />

  const path = location.pathname

  // Нет подписки → разрешаем только choose-plan, остальное → /choose-plan
  if (!hasSubscription) {
    if (path !== '/choose-plan') return <Navigate to="/choose-plan" replace />
    return <Outlet />
  }

  // Есть подписка, onboarding не завершён → только /onboarding
  if (onboarding && !onboarding.is_completed && path !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  return <Outlet />
}

/** Блокируем скролл body на всех SPA-страницах,
 *  но разрешаем на лендинге ("/"), где React рендерит null */
function ScrollLock() {
  const { pathname } = useLocation()
  useEffect(() => {
    const isLanding = pathname === '/'
    const overflow = isLanding ? '' : 'hidden'
    document.documentElement.style.overflow = overflow
    document.body.style.overflow = overflow
    return () => {
      document.documentElement.style.overflow = ''
      document.body.style.overflow = ''
    }
  }, [pathname])
  return null
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollLock />
      <Routes>
        {/* Авторизация */}
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/auth" element={<AuthPage />} />
          </Route>
          <Route path="/auth/callback/google" element={<GoogleCallback />} />
        </Route>

        {/* Все авторизованные маршруты — единый гард */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppGuard />}>
            <Route path="/choose-plan" element={<ChoosePlanPage />} />
            <Route path="/onboarding" element={<NewOnboardingPage />} />
            <Route element={<DashboardLayout />}>
              <Route path="/billing" element={<SubscriptionPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/agent/settings" element={<AgentSettingsPage />} />
              <Route path="/agent/skills"   element={<SkillsPage />} />
              <Route path="/agent/tools"    element={<ToolsPage />} />
              <Route path="/agent/channel"  element={<ChannelPage />} />
            </Route>
          </Route>
        </Route>

        {/* Админка */}
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/users/:userId" element={<AdminUserDetailPage />} />

        {/* Лендинг — React ничего не рендерит */}
        <Route path="/" element={null} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
