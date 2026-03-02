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
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Outlet />
}

// Lazy-loaded feature pages
const AuthPage = () => import('../features/auth/AuthPage').then(m => ({ default: m.AuthPage }))
const GoogleCallback = () => import('../features/auth/GoogleCallback').then(m => ({ default: m.GoogleCallback }))
const PricingPage = () => import('../features/pricing/PricingPage').then(m => ({ default: m.PricingPage }))
const Step1Describe = () => import('../features/onboarding/Step1Describe').then(m => ({ default: m.Step1Describe }))
const Step2Channel = () => import('../features/onboarding/Step2Channel').then(m => ({ default: m.Step2Channel }))
const Step3Skills = () => import('../features/onboarding/Step3Skills').then(m => ({ default: m.Step3Skills }))
const Step4Tools = () => import('../features/onboarding/Step4Tools').then(m => ({ default: m.Step4Tools }))
const Step5Complete = () => import('../features/onboarding/Step5Complete').then(m => ({ default: m.Step5Complete }))
const DashboardPage = () => import('../features/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage }))
const SoulMdPage = () => import('../features/agent/SoulMdPage').then(m => ({ default: m.SoulMdPage }))
const AgentMdPage = () => import('../features/agent/AgentMdPage').then(m => ({ default: m.AgentMdPage }))
const SkillsPage = () => import('../features/skills/SkillsPage').then(m => ({ default: m.SkillsPage }))
const ToolsPage = () => import('../features/tools/ToolsPage').then(m => ({ default: m.ToolsPage }))
const ChannelPage = () => import('../features/channels/ChannelPage').then(m => ({ default: m.ChannelPage }))
const SubscriptionPage = () => import('../features/billing/SubscriptionPage').then(m => ({ default: m.SubscriptionPage }))
const SupportPage = () => import('../features/support/SupportPage').then(m => ({ default: m.SupportPage }))

export const router = createBrowserRouter([
  // Guest-only routes (auth pages wrapped in AuthLayout)
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/auth', lazy: AuthPage },
        ],
      },
      { path: '/auth/callback/google', lazy: GoogleCallback },
    ],
  },
  // Public route (no auth for viewing, payment requires auth)
  { path: '/pricing', lazy: PricingPage },
  // Protected routes
  {
    element: <ProtectedRoute />,
    children: [
      // Onboarding (no sidebar layout)
      { path: '/onboarding/1', lazy: Step1Describe },
      { path: '/onboarding/2', lazy: Step2Channel },
      { path: '/onboarding/3', lazy: Step3Skills },
      { path: '/onboarding/4', lazy: Step4Tools },
      { path: '/onboarding/5', lazy: Step5Complete },
      // Dashboard pages (with sidebar layout)
      {
        element: <DashboardLayout />,
        children: [
          { path: '/dashboard', lazy: DashboardPage },
          { path: '/agent/personality', lazy: SoulMdPage },
          { path: '/agent/rules', lazy: AgentMdPage },
          { path: '/agent/skills', lazy: SkillsPage },
          { path: '/agent/tools', lazy: ToolsPage },
          { path: '/agent/channel', lazy: ChannelPage },
          { path: '/billing', lazy: SubscriptionPage },
          { path: '/support', lazy: SupportPage },
        ],
      },
    ],
  },
  // Default redirect
  { path: '/', element: <Navigate to="/auth" replace /> },
  { path: '*', element: <Navigate to="/auth" replace /> },
])
