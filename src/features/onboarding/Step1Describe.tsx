import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { onboardingDescribe, onboardingSkipDescribe } from '../../api/agents'
import { useAsyncTask } from '../../shared/hooks/useAsyncTask'
import { useApiError } from '../../shared/hooks/useApiError'
import { Button, TextArea, ErrorBanner, Spinner } from '../../shared/ui'
import { OnboardingLayout } from './OnboardingLayout'

type FormValues = {
  description: string
}

export function Step1Describe() {
  const navigate = useNavigate()
  const { error, setError, clearError } = useApiError()
  const [taskId, setTaskId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)
  const hasNavigated = useRef(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { description: '' },
  })

  const { status, isPolling, error: taskError } = useAsyncTask(taskId)

  // React to task completion / failure
  useEffect(() => {
    if (taskId === null) return
    if (hasNavigated.current) return

    if (status === 'completed') {
      hasNavigated.current = true
      navigate('/onboarding/2')
    }

    if (status === 'failed') {
      setTaskId(null)
      setIsSubmitting(false)
      setError({ message: taskError ?? 'Не удалось обработать описание. Попробуйте ещё раз.' })
    }
  }, [taskId, status, taskError, navigate, setError])

  async function onSubmit(data: FormValues) {
    clearError()
    setIsSubmitting(true)
    try {
      const response = await onboardingDescribe(data.description)
      setTaskId(response.task_id)
    } catch (err) {
      setError(err)
      setIsSubmitting(false)
    }
  }

  async function handleSkip() {
    clearError()
    setIsSkipping(true)
    try {
      await onboardingSkipDescribe()
      navigate('/onboarding/2')
    } catch (err) {
      setError(err)
      setIsSkipping(false)
    }
  }

  const isLoading = isSubmitting || isPolling

  return (
    <OnboardingLayout step={1}>
      <h2>Расскажите о вашем бизнесе</h2>
      <p className="hint">
        Опишите, чем вы занимаетесь, и мы настроим ассистента под вас.
        Можно пропустить, но мы не рекомендуем — так ассистент будет работать точнее.
      </p>

      {error && <ErrorBanner message={error.message} />}

      {isPolling && (
        <div className="text-center mb-16">
          <Spinner />
          <p>Анализируем ваше описание...</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <TextArea
          {...register('description', {
            required: 'Введите описание бизнеса или нажмите «Пропустить»',
            minLength: { value: 10, message: 'Минимум 10 символов' },
          })}
          placeholder="Меня зовут Ирина, у меня салон красоты..."
          rows={6}
          disabled={isLoading}
          error={errors.description?.message}
        />

        <div className="form-actions">
          <Button type="submit" loading={isLoading} disabled={isLoading}>
            Далее →
          </Button>
        </div>
      </form>

      <div className="text-center mt-16">
        <button
          type="button"
          className="btn btn--link"
          onClick={handleSkip}
          disabled={isLoading || isSkipping}
        >
          {isSkipping ? 'Пропускаем...' : 'Пропустить'}
        </button>
      </div>
    </OnboardingLayout>
  )
}
