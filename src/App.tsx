import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './shared/hooks/useAuth'
import { DashboardLayout } from './shared/layouts/DashboardLayout'
import { AuthLayout } from './shared/layouts/AuthLayout'
import { AgentSettingsPage } from './features/agent/AgentSettingsPage'
import { SkillsPage } from './features/skills/SkillsPage'
import { ToolsPage } from './features/tools/ToolsPage'
import { ChannelPage } from './features/channels/ChannelPage'
import { SubscriptionPage } from './features/billing/SubscriptionPage'
import { SupportPage } from './features/support/SupportPage'
import { AdminPage } from './features/admin/AdminPage'
import { AuthPage } from './features/auth/AuthPage'
import { GoogleCallback } from './features/auth/GoogleCallback'

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

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Авторизация */}
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/auth" element={<AuthPage />} />
          </Route>
          <Route path="/auth/callback/google" element={<GoogleCallback />} />
        </Route>

        {/* Дашборд — только для авторизованных */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/agent/settings" element={<AgentSettingsPage />} />
            <Route path="/agent/skills"   element={<SkillsPage />} />
            <Route path="/agent/tools"    element={<ToolsPage />} />
            <Route path="/agent/channel"  element={<ChannelPage />} />
            <Route path="/billing"        element={<SubscriptionPage />} />
            <Route path="/support"        element={<SupportPage />} />
          </Route>
        </Route>

        {/* Админка */}
        <Route path="/admin" element={<AdminPage />} />

        {/* Лендинг — React ничего не рендерит */}
        <Route path="/" element={null} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
