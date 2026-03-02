import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useApiError } from '../../shared/hooks/useApiError'
import { Button, TextArea, ErrorBanner, Spinner } from '../../shared/ui'

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

  useEffect(() => {
    if (content !== null) {
      setValue('content', content)
    }
  }, [content, setValue])

  // Auto-hide success message
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
    <div className="page-wrap">
      <h1>{title}</h1>

      {error && <ErrorBanner message={error.message} />}

      {saved && (
        <div className="success-banner mb-16">Сохранено</div>
      )}

      <form onSubmit={handleSubmit(handleSave)}>
        <TextArea
          {...register('content')}
          rows={16}
          disabled={saving || enhancing}
          style={{ fontFamily: 'monospace' }}
        />

        <div className="form-actions mt-16">
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
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            disabled={saving || enhancing}
          >
            Отмена
          </Button>
        </div>
      </form>
    </div>
  )
}
