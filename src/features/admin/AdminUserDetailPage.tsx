import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import type { components } from '../../api/generated/schema'
import {
  assignAdminUserTariff,
  clearAdminAccessToken,
  getAdminAccessToken,
  getAdminUserSubscription,
  listAdminTariffs,
  listAdminUsers,
  updateAdminUser,
} from '../../api/admin'
import type { AdminTariffListItem, AdminUserSubscriptionResponse } from '../../api/admin'
import { Button, Card, ErrorBanner, Input } from '../../shared/ui'

type AdminUserListItem = components['schemas']['AdminUserListItem']
type AdminUpdateUserResponse = components['schemas']['AdminUpdateUserResponse']

type UserPayload = AdminUserListItem | AdminUpdateUserResponse

function toNullableString(value: string): string | null | undefined {
  if (value === '') return undefined
  if (value.trim().toLowerCase() === 'null') return null
  return value
}

function toNullableBoolean(value: string): boolean | null | undefined {
  if (value === '') return undefined
  if (value.trim().toLowerCase() === 'null') return null
  if (value.trim().toLowerCase() === 'true') return true
  if (value.trim().toLowerCase() === 'false') return false
  return undefined
}

function formatDate(value?: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ru-RU')
}

async function findUserById(userId: string): Promise<AdminUserListItem | null> {
  const perPage = 100
  const first = await listAdminUsers(1, perPage)
  const foundFirst = first.items.find((u) => u.id === userId)
  if (foundFirst) return foundFirst

  const totalPages = Math.max(1, Math.ceil(first.total / first.per_page))
  for (let p = 2; p <= totalPages; p += 1) {
    const pageData = await listAdminUsers(p, perPage)
    const found = pageData.items.find((u) => u.id === userId)
    if (found) return found
  }

  return null
}

export function AdminUserDetailPage() {
  const navigate = useNavigate()
  const { userId = '' } = useParams()
  const location = useLocation()

  const stateUser = (location.state as { user?: AdminUserListItem } | null)?.user || null

  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAdminAccessToken()))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [user, setUser] = useState<UserPayload | null>(stateUser)
  const [editName, setEditName] = useState(stateUser?.name || '')
  const [editEmail, setEditEmail] = useState(stateUser?.email || '')
  const [editRole, setEditRole] = useState(stateUser?.role || '')
  const [editActive, setEditActive] = useState(stateUser ? String(stateUser.is_active) : '')

  // Tariff assignment state
  const [tariffs, setTariffs] = useState<AdminTariffListItem[]>([])
  const [subscription, setSubscription] = useState<AdminUserSubscriptionResponse | null>(null)
  const [selectedTariffId, setSelectedTariffId] = useState('')
  const [tariffLoading, setTariffLoading] = useState(false)
  const [tariffError, setTariffError] = useState<string | null>(null)

  const handleLogout = () => {
    clearAdminAccessToken()
    setIsAuthenticated(false)
  }

  useEffect(() => {
    if (!isAuthenticated) return
    if (!userId) {
      setError('Не передан user_id')
      return
    }
    if (stateUser) return

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const found = await findUserById(userId)
        if (!found) {
          setError('Пользователь не найден')
          setUser(null)
          return
        }
        setUser(found)
        setEditName(found.name || '')
        setEditEmail(found.email)
        setEditRole(found.role)
        setEditActive(String(found.is_active))
      } catch (e) {
        setError((e as { message?: string }).message || 'Не удалось загрузить пользователя')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [isAuthenticated, stateUser, userId])

  // Load tariffs and subscription
  useEffect(() => {
    if (!isAuthenticated || !userId) return

    const loadTariffData = async () => {
      try {
        const [tariffList, sub] = await Promise.all([
          listAdminTariffs(1, 100),
          getAdminUserSubscription(userId),
        ])
        setTariffs(tariffList.items)
        setSubscription(sub)
        setSelectedTariffId(sub.tariff_plan_id || '')
      } catch (e) {
        setTariffError((e as { message?: string }).message || 'Не удалось загрузить тарифы')
      }
    }

    void loadTariffData()
  }, [isAuthenticated, userId])

  const handleSave = async (event: FormEvent) => {
    event.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)
    try {
      const updated = await updateAdminUser(user.id, {
        name: toNullableString(editName),
        email: toNullableString(editEmail),
        role: toNullableString(editRole),
        is_active: toNullableBoolean(editActive),
      })
      setUser(updated)
      setEditName(updated.name || '')
      setEditEmail(updated.email)
      setEditRole(updated.role)
      setEditActive(String(updated.is_active))
    } catch (e) {
      setError((e as { message?: string }).message || 'Не удалось сохранить изменения')
    } finally {
      setLoading(false)
    }
  }

  const handleAssignTariff = async () => {
    if (!selectedTariffId || !userId) return

    setTariffLoading(true)
    setTariffError(null)
    try {
      const sub = await assignAdminUserTariff(userId, selectedTariffId)
      setSubscription(sub)
      setSelectedTariffId(sub.tariff_plan_id || '')
    } catch (e) {
      setTariffError((e as { message?: string }).message || 'Не удалось назначить тариф')
    } finally {
      setTariffLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="admin-auth-wrap">
        <Card>
          <h1 className="admin-auth-title">Сессия администратора истекла</h1>
          <Button onClick={() => navigate('/admin')}>Вернуться ко входу</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1>Пользователь</h1>
        <div className="admin-head-actions">
          <Button variant="secondary" onClick={() => navigate('/admin')}>Назад к списку</Button>
          <Button variant="secondary" onClick={handleLogout}>Выйти</Button>
        </div>
      </div>

      {error && (
        <div className="mt-16">
          <ErrorBanner message={error} />
        </div>
      )}

      <Card className="mt-16 admin-detail-card">
        <h2 className="admin-section-title">Детали</h2>
        <p className="subtitle">ID: {userId || '—'}</p>
        <p className="subtitle">Создан: {formatDate(user?.created_at)}</p>

        <form className="admin-user-form" onSubmit={handleSave}>
          <Input label="Имя" value={editName} onChange={(event) => setEditName(event.target.value)} />
          <Input label="Email" value={editEmail} onChange={(event) => setEditEmail(event.target.value)} />
          <Input label="Роль" value={editRole} onChange={(event) => setEditRole(event.target.value)} />
          <Input
            label="is_active"
            value={editActive}
            onChange={(event) => setEditActive(event.target.value)}
            placeholder="true / false / null"
          />
          <Button type="submit" loading={loading} disabled={!user}>Сохранить</Button>
        </form>
      </Card>

      <Card className="mt-16 admin-detail-card">
        <h2 className="admin-section-title">Тариф</h2>

        {subscription && subscription.tariff_name ? (
          <p className="subtitle">
            Текущий тариф: <strong>{subscription.tariff_name}</strong> (статус: {subscription.status})
          </p>
        ) : (
          <p className="subtitle">Тариф не назначен</p>
        )}

        {tariffError && <ErrorBanner message={tariffError} />}

        <div className="admin-user-form">
          <div>
            <label className="form-label">Выберите тариф</label>
            <select
              className="form-input"
              value={selectedTariffId}
              onChange={(e) => setSelectedTariffId(e.target.value)}
            >
              <option value="">— не выбран —</option>
              {tariffs.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.slug}) — {t.price_rub} коп.
                </option>
              ))}
            </select>
          </div>
          <Button
            onClick={handleAssignTariff}
            loading={tariffLoading}
            disabled={!selectedTariffId}
          >
            Назначить тариф
          </Button>
        </div>
      </Card>
    </div>
  )
}
