import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery, useMutation } from '@tanstack/react-query'
import {
  getAgentAbout,
  saveAgentAbout,
  type AgentAboutRequest,
} from '../../api/agents'
import { Button, ErrorBanner, Spinner, Tooltip } from '../../shared/ui'

// ── Типы формы ────────────────────────────────────────────────────────────────

type FormValues = {
  name: string
  location: string
  about_self: string
  occupation: string
  agent_restrictions: string
}

type SaveState =
  | { type: 'idle' }
  | { type: 'saving' }
  | { type: 'saved' }
  | { type: 'error'; message: string }

// ── Компонент ─────────────────────────────────────────────────────────────────

export function AgentSettingsPage() {
  const [saveState, setSaveState] = useState<SaveState>({ type: 'idle' })
  const savedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['agentAbout'],
    queryFn: getAgentAbout,
    retry: 1,
  })

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: {
      name: '',
      location: '',
      about_self: '',
      occupation: '',
      agent_restrictions: '',
    },
  })

  useEffect(() => {
    if (data) {
      reset({
        name: data.name ?? '',
        location: data.location ?? '',
        about_self: data.about_self ?? '',
        occupation: data.occupation ?? '',
        agent_restrictions: data.agent_restrictions ?? '',
      })
    }
  }, [data, reset])

  const saveMutation = useMutation({
    mutationFn: (values: AgentAboutRequest) => saveAgentAbout(values),
    onMutate: () => setSaveState({ type: 'saving' }),
    onSuccess: () => {
      setSaveState({ type: 'saved' })
      savedTimeoutRef.current = setTimeout(() => setSaveState({ type: 'idle' }), 3000)
    },
    onError: (err: Error) =>
      setSaveState({ type: 'error', message: err.message }),
  })

  useEffect(() => {
    return () => {
      if (savedTimeoutRef.current) clearTimeout(savedTimeoutRef.current)
    }
  }, [])

  function onSubmit(values: FormValues) {
    const payload: AgentAboutRequest = {
      name: values.name || null,
      location: values.location || null,
      about_self: values.about_self || null,
      occupation: values.occupation || null,
      agent_restrictions: values.agent_restrictions || null,
    }
    saveMutation.mutate(payload)
  }

  // ── Рендер ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="page-wrap">
        <div className="agent-settings-page">
          <Spinner size="md" />
          <p className="text-muted mt-16">Загружаем настройки...</p>
        </div>
      </div>
    )
  }

  const isSaving = saveState.type === 'saving'

  return (
    <div className="page-wrap">
      <div className="agent-settings-page">
        <h1>Настройки агента</h1>
        <p className="text-muted">
          Расскажите о себе — агент будет учитывать эти данные в работе
        </p>

        {isError && (
          <ErrorBanner
            message={(error as Error)?.message ?? 'Не удалось загрузить данные'}
          />
        )}

        <form className="agent-settings-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="name">Имя</label>
            </div>
            <input
              id="name"
              className="form-input"
              placeholder="Как вас зовут?"
              {...register('name')}
            />
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="location">Место жительства</label>
              <span className="optional">необязательно</span>
              <Tooltip text="Заполняем это, чтобы понять ваш часовой пояс, из какого вы города, и учитывать это в рекомендациях" />
            </div>
            <input
              id="location"
              className="form-input"
              placeholder="Город или страна"
              {...register('location')}
            />
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="about_self">Расскажите о себе</label>
              <span className="optional">необязательно</span>
              <Tooltip text="Это нужно, чтобы агент понимал вашу специализацию и давал более точные советы" />
            </div>
            <textarea
              id="about_self"
              className="form-input agent-settings-textarea"
              rows={4}
              placeholder="Кто вы, чем занимаетесь, какой у вас опыт..."
              {...register('about_self')}
            />
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="occupation">Чем вы занимаетесь?</label>
              <span className="optional">необязательно</span>
              <Tooltip text="Укажите вашу профессию или сферу деятельности — агент сможет давать более релевантные рекомендации" />
            </div>
            <input
              id="occupation"
              className="form-input"
              placeholder="Предприниматель, разработчик, дизайнер..."
              {...register('occupation')}
            />
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label htmlFor="agent_restrictions">Что нельзя делать агенту</label>
              <span className="optional">необязательно</span>
              <Tooltip text="Опишите ограничения: что агент никогда не должен делать, какие темы обходить стороной" />
            </div>
            <textarea
              id="agent_restrictions"
              className="form-input agent-settings-textarea"
              rows={3}
              placeholder="Например: не давать скидки без моего подтверждения, не обсуждать конкурентов..."
              {...register('agent_restrictions')}
            />
          </div>

          <div className="agent-settings-actions">
            <Button
              type="submit"
              variant="primary"
              loading={isSaving}
              disabled={isSaving}
            >
              {isSaving ? 'Сохраняем...' : 'Сохранить'}
            </Button>

            {saveState.type === 'saved' && (
              <span className="agent-settings-saved">Данные сохранены</span>
            )}

            {saveState.type === 'error' && (
              <ErrorBanner message={saveState.message} />
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
