import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../shared/ui'

const TOPICS = [
  { value: 'agent', label: 'Агент' },
  { value: 'payment', label: 'Оплата' },
  { value: 'integration', label: 'Интеграция' },
  { value: 'channel', label: 'Канал связи' },
  { value: 'other', label: 'Другое' },
]

const CONTACT_METHODS = [
  { value: 'telegram', label: 'Telegram' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Телефон' },
]

type FormValues = {
  topic: string
  description: string
  contactMethod: string
  contact: string
  consent: boolean
}

export function SupportPage() {
  const navigate = useNavigate()
  const [ticketId, setTicketId] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      topic: '',
      description: '',
      contactMethod: 'telegram',
      contact: '',
      consent: false,
    },
  })

  function onSubmit(_data: FormValues) {
    const id = `SUP-${Date.now()}`
    setTicketId(id)
  }

  function handleReset() {
    setTicketId(null)
    reset()
  }

  if (ticketId) {
    return (
      <div className="support-page">
        <div className="support-success">
          <div className="styled-indicator styled-indicator--success">{'\u2713'}</div>
          <h2>Обращение отправлено</h2>
          <p className="text-muted mb-16">
            Номер тикета: <strong>{ticketId}</strong>
          </p>
          <div className="support-success-actions">
            <Button onClick={handleReset}>Отправить ещё</Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Вернуться в дашборд
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="support-page">
      <h1>Поддержка</h1>
      <p className="text-muted mb-24">Опишите вашу проблему, и мы свяжемся с вами</p>

      <form className="support-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="form-group">
          <label>Тема</label>
          <select
            className={`form-input ${errors.topic ? 'input-error' : ''}`}
            {...register('topic', { required: 'Выберите тему' })}
          >
            <option value="">Выберите тему...</option>
            {TOPICS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          {errors.topic && <span className="form-error">{errors.topic.message}</span>}
        </div>

        <div className="form-group">
          <label>Описание</label>
          <textarea
            className={`form-input ${errors.description ? 'input-error' : ''}`}
            rows={5}
            placeholder="Подробно опишите вашу проблему..."
            {...register('description', { required: 'Введите описание' })}
          />
          {errors.description && <span className="form-error">{errors.description.message}</span>}
        </div>

        <div className="form-group">
          <label>Способ связи</label>
          <div className="support-radio-group">
            {CONTACT_METHODS.map((m) => (
              <label key={m.value} className="support-radio">
                <input
                  type="radio"
                  value={m.value}
                  {...register('contactMethod')}
                />
                <span>{m.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Контакт</label>
          <input
            type="text"
            className={`form-input ${errors.contact ? 'input-error' : ''}`}
            placeholder="@username или номер телефона"
            {...register('contact', { required: 'Укажите контакт' })}
          />
          {errors.contact && <span className="form-error">{errors.contact.message}</span>}
        </div>

        <div className="support-consent">
          <label className="support-consent-label">
            <input
              type="checkbox"
              {...register('consent', { required: 'Необходимо согласие' })}
            />
            <span>
              Я соглашаюсь на обработку персональных данных в соответствии с{' '}
              <a href="#" onClick={(e) => e.preventDefault()}>политикой конфиденциальности</a>
            </span>
          </label>
          {errors.consent && <span className="form-error">{errors.consent.message}</span>}
        </div>

        <Button type="submit" style={{ width: '100%' }}>
          Отправить
        </Button>
      </form>
    </div>
  )
}
