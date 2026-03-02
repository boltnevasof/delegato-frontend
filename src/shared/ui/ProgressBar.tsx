type ProgressBarProps = {
  currentStep: number
  totalSteps: number
  label?: string
}

export function ProgressBar({ currentStep, totalSteps, label }: ProgressBarProps) {
  return (
    <div className="progress">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1
        return (
          <div key={step} style={{ display: 'contents' }}>
            <div className={`progress-step ${step <= currentStep ? 'active' : ''}`} />
            {step < totalSteps && (
              <div className={`progress-line ${step < currentStep ? 'active' : ''}`} />
            )}
          </div>
        )
      })}
      {label && <span className="progress-label">{label}</span>}
    </div>
  )
}
