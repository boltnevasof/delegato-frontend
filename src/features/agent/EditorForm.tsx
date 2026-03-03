import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useApiError } from '../../shared/hooks/useApiError'
import { Button, TextArea, ErrorBanner } from '../../shared/ui'

type EditorFormProps = {
  content: string | null
  onSave: (content: string) => Promise<void>
  onEnhance: (content: string) => Promise<string | null>
  title: string
}

type FormValues = {
  content: string
}

export function EditorForm({ content, onSave, onEnhance, title }: EditorFormProps) {
  const navigate = useNavigate()
  const { error, setError, clearError } = useApiError()
  const [saving, setSaving] = useState(false)
  const [enhancing, setEnhancing] = useState(false)
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, setValue, watch } = useForm<FormValues>({
    defaultValues: { content: content ?? '' },
  })

  const isPersonality = title.toLowerCase().includes('личность')
  const helperText = isPersonality
    ? 'Опишите характер, стиль общения и тон вашего агента. Эти настройки влияют на то, как он формулирует ответы, ведет диалог и воспринимается клиентами.'
    : 'Зафиксируйте правила, ограничения и приоритеты работы агента. Эти настройки определяют, какие действия он делает, какие не делает и как принимает решения в спорных ситуациях.'

  useEffect(() => {
    if (content !== null) {
      setValue('content', content)
    }
  }, [content, setValue])

  useEffect(() => {
    if (!saved) return
    const timer = setTimeout(() => setSaved(false), 2000)
    return () => clearTimeout(timer)
  }, [saved])

  async function handleSave(data: FormValues) {
    clearError()
    setSaving(true)
    try {
      await onSave(data.content)
      setSaved(true)
    } catch (err) {
      setError(err)
    } finally {
      setSaving(false)
    }
  }

  async function handleEnhanceClick() {
    clearError()
    setEnhancing(true)
    try {
      const currentContent = watch('content')
      const enhanced = await onEnhance(currentContent)
      if (enhanced !== null) {
        setValue('content', enhanced)
      }
    } catch (err) {
      setError(err)
    } finally {
      setEnhancing(false)
    }
  }

  return (
    <div className="page-wrap page-wrap--wide agent-editor-page">
      <h1>{title}</h1>

      {error && <ErrorBanner message={error.message} />}

      {saved && (
        <div className="success-banner mb-16">Сохранено</div>
      )}

      <form onSubmit={handleSubmit(handleSave)} className="agent-editor-shell">
        <TextArea
          {...register('content')}
          className="agent-editor-input"
          rows={14}
          disabled={saving || enhancing}
          placeholder={isPersonality
            ? 'Опишите, каким должен быть ваш агент: стиль, тон, формат общения, поведение в диалоге...'
            : 'Опишите правила работы агента: что обязательно делать, что запрещено, как действовать в нестандартных случаях...'}
        />

        <div className="form-actions mt-16 agent-editor-actions">
          <div className="agent-editor-actions-primary">
            <Button type="submit" loading={saving} disabled={enhancing}>
              Сохранить
            </Button>
            <Button
              type="button"
              variant="secondary"
              loading={enhancing}
              disabled={saving}
              onClick={handleEnhanceClick}
            >
              {enhancing ? 'Улучшаем...' : 'Улучшить с AI'}
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            disabled={saving || enhancing}
          >
            Отмена
          </Button>
        </div>

        <p className="agent-editor-helper">{helperText}</p>
      </form>
    </div>
  )
}
