import type { ReactNode } from 'react'
import { ProgressBar } from '../../shared/ui'

type OnboardingLayoutProps = {
  step: number
  label?: string
  children: ReactNode
}

export function OnboardingLayout({ step, label, children }: OnboardingLayoutProps) {
  return (
    <div className="page-wrap">
      <div className="auth-container">
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
