import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../shared/hooks/useAuth'
import { DashboardLayout } from '../shared/layouts/DashboardLayout'
import { AuthLayout } from '../shared/layouts/AuthLayout'

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

const lazyAuth = () => import('../features/auth/AuthPage').then(m => ({ Component: m.AuthPage }))
const lazyGoogleCb = () => import('../features/auth/GoogleCallback').then(m => ({ Component: m.GoogleCallback }))
const lazyAgentSettings = () => import('../features/agent/AgentSettingsPage').then(m => ({ Component: m.AgentSettingsPage }))
const lazySkills = () => import('../features/skills/SkillsPage').then(m => ({ Component: m.SkillsPage }))
const lazyTools = () => import('../features/tools/ToolsPage').then(m => ({ Component: m.ToolsPage }))
const lazyChan = () => import('../features/channels/ChannelPage').then(m => ({ Component: m.ChannelPage }))
const lazySub = () => import('../features/billing/SubscriptionPage').then(m => ({ Component: m.SubscriptionPage }))
const lazySup = () => import('../features/support/SupportPage').then(m => ({ Component: m.SupportPage }))
const lazyAdmin = () => import('../features/admin/AdminPage').then(m => ({ Component: m.AdminPage }))
const lazyAdminUser = () => import('../features/admin/AdminUserDetailPage').then(m => ({ Component: m.AdminUserDetailPage }))
const lazyLanding = () => import('../features/landing/LandingPage').then(m => ({ Component: m.LandingPage }))
const lazyNewOnboarding = () => import('../features/onboarding/NewOnboardingPage').then(m => ({ Component: m.NewOnboardingPage }))

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/auth', lazy: lazyAuth },
        ],
      },
      { path: '/auth/callback/google', lazy: lazyGoogleCb },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/agent/settings', lazy: lazyAgentSettings },
          { path: '/agent/skills', element: <Navigate to="/agent/settings" replace /> },
          { path: '/agent/tools', element: <Navigate to="/agent/settings" replace /> },
          { path: '/agent/channel', lazy: lazyChan },
          { path: '/billing', lazy: lazySub },
          { path: '/support', lazy: lazySup },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/onboarding', lazy: lazyNewOnboarding },
    ],
  },
  {
    path: '/admin',
    element: <Outlet />,
    children: [
      { index: true, lazy: lazyAdmin },
      { path: 'users/:userId', lazy: lazyAdminUser },
    ],
  },
  { path: '/', lazy: lazyLanding },
  { path: '*', element: <Navigate to="/" replace /> },
])
