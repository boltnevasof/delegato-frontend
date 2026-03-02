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

// react-router-dom v7 lazy() must return { Component }
const lazyAuth = () => import('../features/auth/AuthPage').then(m => ({ Component: m.AuthPage }))
const lazyGoogleCb = () => import('../features/auth/GoogleCallback').then(m => ({ Component: m.GoogleCallback }))
const lazyPricing = () => import('../features/pricing/PricingPage').then(m => ({ Component: m.PricingPage }))
const lazyStep1 = () => import('../features/onboarding/Step1Describe').then(m => ({ Component: m.Step1Describe }))
const lazyStep2 = () => import('../features/onboarding/Step2Channel').then(m => ({ Component: m.Step2Channel }))
const lazyStep3 = () => import('../features/onboarding/Step3Skills').then(m => ({ Component: m.Step3Skills }))
const lazyStep4 = () => import('../features/onboarding/Step4Tools').then(m => ({ Component: m.Step4Tools }))
const lazyStep5 = () => import('../features/onboarding/Step5Complete').then(m => ({ Component: m.Step5Complete }))
const lazyDash = () => import('../features/dashboard/DashboardPage').then(m => ({ Component: m.DashboardPage }))
const lazySoul = () => import('../features/agent/SoulMdPage').then(m => ({ Component: m.SoulMdPage }))
const lazyAgent = () => import('../features/agent/AgentMdPage').then(m => ({ Component: m.AgentMdPage }))
const lazySkills = () => import('../features/skills/SkillsPage').then(m => ({ Component: m.SkillsPage }))
const lazyTools = () => import('../features/tools/ToolsPage').then(m => ({ Component: m.ToolsPage }))
const lazyChan = () => import('../features/channels/ChannelPage').then(m => ({ Component: m.ChannelPage }))
const lazySub = () => import('../features/billing/SubscriptionPage').then(m => ({ Component: m.SubscriptionPage }))
const lazySup = () => import('../features/support/SupportPage').then(m => ({ Component: m.SupportPage }))
const lazyLanding = () => import('../features/landing/LandingPage').then(m => ({ Component: m.LandingPage }))

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
  { path: '/pricing', lazy: lazyPricing },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/onboarding/1', lazy: lazyStep1 },
      { path: '/onboarding/2', lazy: lazyStep2 },
      { path: '/onboarding/3', lazy: lazyStep3 },
      { path: '/onboarding/4', lazy: lazyStep4 },
      { path: '/onboarding/5', lazy: lazyStep5 },
      {
        element: <DashboardLayout />,
        children: [
          { path: '/dashboard', lazy: lazyDash },
          { path: '/agent/personality', lazy: lazySoul },
          { path: '/agent/rules', lazy: lazyAgent },
          { path: '/agent/skills', lazy: lazySkills },
          { path: '/agent/tools', lazy: lazyTools },
          { path: '/agent/channel', lazy: lazyChan },
          { path: '/billing', lazy: lazySub },
          { path: '/support', lazy: lazySup },
        ],
      },
    ],
  },
  { path: '/', lazy: lazyLanding },
  { path: '*', element: <Navigate to="/" replace /> },
])
