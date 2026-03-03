import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { ProgressBar } from '../../shared/ui'

type OnboardingLayoutProps = {
  step: number
  label?: string
  children: ReactNode
}

export function OnboardingLayout({ step, label, children }: OnboardingLayoutProps) {
  return (
    <div className="auth-layout">
      <header className="header">
        <NavLink to="/" className="header-logo">
          Delegato
        </NavLink>
      </header>

      <div className="page-wrap page-wrap--onboarding">
        <div className="onboarding-wrap">
          <ProgressBar
            currentStep={step}
            totalSteps={5}
            label={label ?? `Шаг ${step} из 5`}
          />
          {children}
        </div>
      </div>
    </div>
  )
}
