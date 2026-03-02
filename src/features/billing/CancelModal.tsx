import { useState } from 'react'
import { cancel } from '../../api/subscriptions'
import { useApiError } from '../../shared/hooks/useApiError'
import { Modal, Button, ErrorBanner } from '../../shared/ui'

const CANCEL_REASONS = [
  'Слишком дорого',
  'Не пользуюсь агентом',
  'Перехожу к конкуренту',
  'Не хватает функций',
  'Другое',
]

type CancelModalProps = {
  open: boolean
  onClose: () => void
  onCancelled: (gracePeriodEnd: string, message: string) => void
}

export function CancelModal({ open, onClose, onCancelled }: CancelModalProps) {
  const { error, setError, clearError } = useApiError()
  const [reason, setReason] = useState('')
  const [cancelling, setCancelling] = useState(false)

  async function handleConfirm() {
    if (!reason) return
    clearError()
    setCancelling(true)
    try {
      const result = await cancel(reason)
      onCancelled(result.grace_period_end, result.message)
      onClose()
    } catch (err) {
      setError(err)
    } finally {
      setCancelling(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Отмена подписки"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={cancelling}>
            Не отменять
          </Button>
          <Button variant="danger" loading={cancelling} disabled={!reason} onClick={handleConfirm}>
            Подтвердить отмену
          </Button>
        </>
      }
    >
      {error && <ErrorBanner message={error.message} />}

      <p>Укажите причину отмены:</p>

      <div className="cancel-reasons">
        {CANCEL_REASONS.map((r) => (
          <label key={r} className="radio-option" style={{ display: 'block', margin: '8px 0', cursor: 'pointer' }}>
            <input
              type="radio"
              name="cancel_reason"
              value={r}
              checked={reason === r}
              onChange={() => setReason(r)}
            />
            <span style={{ marginLeft: 8 }}>{r}</span>
          </label>
        ))}
      </div>
    </Modal>
  )
}
