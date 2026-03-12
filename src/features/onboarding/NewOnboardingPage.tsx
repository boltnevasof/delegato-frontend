import { useState, useEffect, useCallback } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  getOnboardingState,
  saveOnboardingAnswer,
  updateOnboardingStep,
  finishOnboarding,
  type OnboardingStateResponse,
} from '../../api/agents'
import { Button, ErrorBanner, Spinner } from '../../shared/ui'

// ── Шаги onboarding ─────────────────────────────────────────────────────────

const STEPS = [
  {
    question_id: 'name',
    title: 'Введите ваше имя',
    hint: '',
    placeholder: 'Как вас зовут?',
    inputType: 'input' as const,
  },
  {
    question_id: 'location',
    title: 'Место жительства',
    hint: 'Заполняем это, чтобы понять ваш часовой пояс, из какого вы города, и учитывать это в рекомендациях',
    placeholder: 'Город или страна',
    inputType: 'input' as const,
  },
  {
    question_id: 'occupation',
    title: 'Чем вы занимаетесь?',
    hint: 'Укажите вашу профессию или сферу деятельности — агент сможет давать более релевантные рекомендации',
    placeholder: 'Предприниматель, разработчик, дизайнер...',
    inputType: 'textarea' as const,
  },
  {
    question_id: 'about_self',
    title: 'Расскажите о себе',
    hint: 'Это нужно, чтобы агент понимал вашу специализацию и давал более точные советы',
    placeholder: 'Кто вы, чем занимаетесь, какой у вас опыт...',
    inputType: 'textarea' as const,
  },
  {
    question_id: 'agent_restrictions',
    title: 'Что нельзя делать агенту',
    hint: 'Опишите ограничения: что агент никогда не должен делать, какие темы обходить стороной',
    placeholder: 'Например: не давать скидки без моего подтверждения, не обсуждать конкурентов...',
    inputType: 'textarea' as const,
  },
]

const TOTAL_STEPS = STEPS.length

// ── Компонент Progress Bar (кружки) ─────────────────────────────────────────

function OnboardingProgress({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="onboarding-progress">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1
        const isActive = step === currentStep
        const isCompleted = step < currentStep
        return (
          <div key={step} style={{ display: 'contents' }}>
            <div
              className={
                'onboarding-progress-dot' +
                (isActive ? ' onboarding-progress-dot--active' : '') +
                (isCompleted ? ' onboarding-progress-dot--completed' : '')
              }
            />
            {step < totalSteps && (
              <div
                className={
                  'onboarding-progress-line' +
                  (isCompleted ? ' onboarding-progress-line--active' : '')
                }
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Экран вступления ─────────────────────────────────────────────────────────

function IntroScreen({ onNext }: { onNext: () => void }) {
  return (
    <div className="onboarding-step-content onboarding-intro">
      <h2>Добро пожаловать в Delegato</h2>
      <p className="onboarding-step-hint">
        Мы зададим несколько вопросов, чтобы лучше понять ваши предпочтения.
        Это поможет агенту давать более точные и персонализированные рекомендации.
      </p>
      <div className="onboarding-step-actions">
        <Button variant="primary" onClick={onNext}>
          Начать
        </Button>
      </div>
    </div>
  )
}

// ── Экран вопроса ────────────────────────────────────────────────────────────

function QuestionScreen({
  step,
  value,
  onChange,
  onBack,
  onNext,
  isSaving,
  isLast,
}: {
  step: (typeof STEPS)[number]
  value: string
  onChange: (val: string) => void
  onBack: () => void
  onNext: () => void
  isSaving: boolean
  isLast: boolean
}) {
  return (
    <div className="onboarding-step-content">
      <h2>{step.title}</h2>
      {step.hint && <p className="onboarding-step-hint">{step.hint}</p>}

      {step.inputType === 'textarea' ? (
        <textarea
          className="form-input"
          rows={6}
          placeholder={step.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isSaving}
        />
      ) : (
        <input
          className={`form-input${step.question_id === 'name' ? ' onboarding-input-name' : ''}`}
          placeholder={step.placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isSaving}
        />
      )}

      <div className="onboarding-step-actions">
        <Button variant="secondary" onClick={onBack} disabled={isSaving}>
          Назад
        </Button>
        <Button variant="primary" onClick={onNext} loading={isSaving} disabled={isSaving}>
          {isLast ? 'Завершить' : 'Далее'}
        </Button>
      </div>
    </div>
  )
}

// ── Основной компонент ───────────────────────────────────────────────────────

export function NewOnboardingPage() {
  const navigate = useNavigate()
  const [currentScreen, setCurrentScreen] = useState<number>(0) // 0 = intro, 1-5 = questions
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Загружаем текущее состояние onboarding
  const { data: state, isLoading } = useQuery({
    queryKey: ['onboardingState'],
    queryFn: getOnboardingState,
    retry: 1,
  })

  // Инициализируем state из backend
  useEffect(() => {
    if (!state || isInitialized) return

    // Если onboarding уже завершён — редирект на настройки
    if (state.is_completed) {
      navigate('/agent/settings', { replace: true })
      return
    }

    // Восстанавливаем ответы
    const restored: Record<string, string> = {}
    for (const a of state.answers) {
      if (a.answer) restored[a.question_id] = a.answer
    }
    setAnswers(restored)

    // Восстанавливаем шаг (0 = intro, 1+ = вопросы)
    setCurrentScreen(state.current_step)
    setIsInitialized(true)
  }, [state, isInitialized, navigate])

  // Мутация: сохранить ответ
  const answerMutation = useMutation({
    mutationFn: ({ questionId, answer }: { questionId: string; answer: string | null }) =>
      saveOnboardingAnswer(questionId, answer),
    onError: (err: Error) => setError(err.message),
  })

  // Мутация: обновить шаг
  const stepMutation = useMutation({
    mutationFn: (step: number) => updateOnboardingStep(step),
    onError: (err: Error) => setError(err.message),
  })

  // Мутация: завершить onboarding
  const finishMutation = useMutation({
    mutationFn: finishOnboarding,
    onSuccess: () => {
      navigate('/agent/settings', { replace: true })
    },
    onError: (err: Error) => setError(err.message),
  })

  const isSaving = answerMutation.isPending || stepMutation.isPending || finishMutation.isPending

  // Сохранить текущий ответ и перейти к следующему шагу
  const saveCurrentAndGoTo = useCallback(async (targetScreen: number) => {
    setError(null)

    // Если уходим с экрана вопроса — сохраняем ответ
    if (currentScreen >= 1 && currentScreen <= TOTAL_STEPS) {
      const step = STEPS[currentScreen - 1]
      const answer = answers[step.question_id] || null
      try {
        await saveOnboardingAnswer(step.question_id, answer)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка сохранения')
        return
      }
    }

    // Сохраняем шаг на backend
    try {
      await updateOnboardingStep(targetScreen)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка сохранения шага')
      return
    }

    setCurrentScreen(targetScreen)
  }, [currentScreen, answers])

  // Завершить onboarding
  const handleFinish = useCallback(async () => {
    setError(null)

    // Сохраняем последний ответ
    if (currentScreen >= 1 && currentScreen <= TOTAL_STEPS) {
      const step = STEPS[currentScreen - 1]
      const answer = answers[step.question_id] || null
      try {
        await saveOnboardingAnswer(step.question_id, answer)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка сохранения')
        return
      }
    }

    finishMutation.mutate()
  }, [currentScreen, answers, finishMutation])

  // ── Рендер ──────────────────────────────────────────────────────────────────

  if (isLoading || !isInitialized) {
    return (
      <div className="auth-layout">
        <header className="header">
          <NavLink to="/" className="header-logo">Delegato</NavLink>
        </header>
        <div className="page-wrap page-wrap--onboarding">
          <div className="onboarding-wrap">
            <Spinner size="md" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-layout">
      <header className="header">
        <NavLink to="/" className="header-logo">Delegato</NavLink>
      </header>
      <div className="page-wrap page-wrap--onboarding">
        <div className="onboarding-wrap">
          {error && <ErrorBanner message={error} />}

          {currentScreen === 0 ? (
            <IntroScreen onNext={() => saveCurrentAndGoTo(1)} />
          ) : (
            <>
              <OnboardingProgress currentStep={currentScreen} totalSteps={TOTAL_STEPS} />
              <QuestionScreen
                step={STEPS[currentScreen - 1]}
                value={answers[STEPS[currentScreen - 1].question_id] ?? ''}
                onChange={(val) =>
                  setAnswers((prev) => ({ ...prev, [STEPS[currentScreen - 1].question_id]: val }))
                }
                onBack={() => saveCurrentAndGoTo(currentScreen - 1)}
                onNext={
                  currentScreen === TOTAL_STEPS
                    ? handleFinish
                    : () => saveCurrentAndGoTo(currentScreen + 1)
                }
                isSaving={isSaving}
                isLast={currentScreen === TOTAL_STEPS}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
