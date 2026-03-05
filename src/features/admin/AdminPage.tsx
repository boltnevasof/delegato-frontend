import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import type { components } from '../../api/generated/schema'
import {
  adminLogin,
  clearAdminAccessToken,
  createAdminTariff,
  deleteAdminTariff,
  getAdminAccessToken,
  getAdminServerLogs,
  getAdminServerStats,
  listAdminAgents,
  listAdminOtpCodes,
  listAdminServers,
  listAdminSupportRequests,
  listAdminTariffs,
  listAdminUsers,
  updateAdminTariff,
} from '../../api/admin'
import type {
  AdminSupportRequestItem,
  AdminSupportRequestListResponse,
  AdminTariffListItem,
  AdminTariffListResponse,
  AdminCreateTariffRequest,
} from '../../api/admin'
import { Button, Card, ErrorBanner, Input } from '../../shared/ui'
import { AdminTable, type AdminTableColumn } from './components/AdminTable'

type TabKey =
  | 'users'
  | 'servers'
  | 'servers_stats'
  | 'agents'
  | 'custom_requests'
  | 'otp_codes'
  | 'tariffs'

type AdminUserListItem = components['schemas']['AdminUserListItem']
type AdminUserListResponse = components['schemas']['AdminUserListResponse']
type AdminServerListItem = components['schemas']['AdminServerListItem']
type AdminServerListResponse = components['schemas']['AdminServerListResponse']
type AdminServerStats = components['schemas']['AdminServerStats']
type ServerLogItem = components['schemas']['ServerLogItem']
type ServerLogListResponse = components['schemas']['ServerLogListResponse']
type AdminAgentListItem = components['schemas']['AdminAgentListItem']
type AdminAgentListResponse = components['schemas']['AdminAgentListResponse']
type AdminOTPCodeItem = components['schemas']['AdminOTPCodeItem']
type AdminOTPCodeListResponse = components['schemas']['AdminOTPCodeListResponse']

type ListData =
  | AdminUserListResponse
  | AdminServerListResponse
  | ServerLogListResponse
  | AdminAgentListResponse
  | AdminSupportRequestListResponse
  | AdminOTPCodeListResponse
  | AdminTariffListResponse

const TABS: { key: TabKey; label: string }[] = [
  { key: 'users', label: 'Пользователи' },
  { key: 'servers', label: 'Серверы' },
  { key: 'servers_stats', label: 'Статистика серверов' },
  { key: 'agents', label: 'Агенты' },
  { key: 'custom_requests', label: 'Заявки' },
  { key: 'otp_codes', label: 'OTP-коды' },
  { key: 'tariffs', label: 'Тарифы' },
]

function formatDate(value?: string): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ru-RU')
}

function shortId(value?: string | null): string {
  if (!value) return '—'
  return value.length > 8 ? value.slice(0, 8) + '...' : value
}

function isPaginatedResponse(data: unknown): data is ListData {
  return Boolean(
    data &&
    typeof data === 'object' &&
    'items' in data &&
    'total' in data &&
    'page' in data &&
    'per_page' in data,
  )
}

const EMPTY_TARIFF_FORM: AdminCreateTariffRequest = {
  slug: '',
  name: '',
  price_rub: 0,
  max_channels: null,
  llm_model: null,
  skills_access: 'basic',
  is_self_service: true,
  is_active: true,
}

function descriptionPreview(value?: string | null): string {
  const text = value ?? ''
  if (!text) return '—'
  if (text.length <= 60) return text
  return text.slice(0, 60) + '...'
}

export function AdminPage() {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAdminAccessToken()))
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [activeTab, setActiveTab] = useState<TabKey>('users')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [page, setPage] = useState(1)
  const perPage = 20

  const [search, setSearch] = useState('')
  const [idSearch, setIdSearch] = useState('')
  const [serverStatus, setServerStatus] = useState('')
  const [selectedServerId, setSelectedServerId] = useState('')
  const [logLevel, setLogLevel] = useState('')
  const [customStatus, setCustomStatus] = useState('')
  const [otpEmail, setOtpEmail] = useState('')

  const [listData, setListData] = useState<ListData | null>(null)
  const [statsData, setStatsData] = useState<AdminServerStats | null>(null)
  const [serverLogsData, setServerLogsData] = useState<ServerLogListResponse | null>(null)
  const [selectedSupportRequest, setSelectedSupportRequest] = useState<AdminSupportRequestItem | null>(null)

  // Tariff form state
  const [tariffForm, setTariffForm] = useState<AdminCreateTariffRequest>({ ...EMPTY_TARIFF_FORM })
  const [editingTariffId, setEditingTariffId] = useState<string | null>(null)
  const [showTariffForm, setShowTariffForm] = useState(false)

  const totalPages = useMemo(() => {
    if (!listData) return 1
    return Math.max(1, Math.ceil(listData.total / listData.per_page))
  }, [listData])

  const runRequest = async (callback: () => Promise<void>) => {
    setError(null)
    setLoading(true)
    try {
      await callback()
    } catch (e) {
      setError((e as { message?: string }).message || 'Ошибка запроса')
    } finally {
      setLoading(false)
    }
  }

  const loadServerLogs = async (serverId: string, targetPage = 1) => {
    await runRequest(async () => {
      const data = await getAdminServerLogs(serverId.trim(), targetPage, perPage, logLevel || undefined)
      setSelectedServerId(serverId)
      setServerLogsData(data)
    })
  }

  const loadData = async (targetPage = page) => {
    await runRequest(async () => {
      setStatsData(null)

      if (activeTab === 'servers_stats') {
        const stats = await getAdminServerStats()
        setStatsData(stats)
        setListData(null)
        return
      }

      let data: ListData
      switch (activeTab) {
        case 'users':
          data = await listAdminUsers(targetPage, perPage, search || undefined)
          break
        case 'servers':
          data = await listAdminServers(targetPage, perPage, serverStatus || undefined)
          break
        case 'agents':
          data = await listAdminAgents(targetPage, perPage)
          break
        case 'custom_requests':
          data = await listAdminSupportRequests(targetPage, perPage, customStatus || undefined)
          break
        case 'otp_codes':
          data = await listAdminOtpCodes(targetPage, perPage, otpEmail || undefined)
          break
        case 'tariffs':
          data = await listAdminTariffs(targetPage, perPage)
          break
        default:
          data = await listAdminUsers(targetPage, perPage, search || undefined)
      }

      setListData(data)
      setPage(data.page)

      if (activeTab === 'servers' && selectedServerId.trim()) {
        const logs = await getAdminServerLogs(selectedServerId.trim(), 1, perPage, logLevel || undefined)
        setServerLogsData(logs)
      }
    })
  }

  const filterRowsById = <T extends { id?: string | null }>(rows: T[]): T[] => {
    const query = idSearch.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((row) => (row.id || '').toLowerCase().includes(query))
  }

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    await runRequest(async () => {
      await adminLogin({ username, password })
      setIsAuthenticated(true)
    })
  }

  const handleLogout = () => {
    clearAdminAccessToken()
    setIsAuthenticated(false)
    setListData(null)
    setStatsData(null)
    setServerLogsData(null)
    setSelectedSupportRequest(null)
    setError(null)
  }

  // --- Tariff CRUD handlers ---

  const openCreateTariff = () => {
    setTariffForm({ ...EMPTY_TARIFF_FORM })
    setEditingTariffId(null)
    setShowTariffForm(true)
  }

  const openEditTariff = (tariff: AdminTariffListItem) => {
    setTariffForm({
      slug: tariff.slug,
      name: tariff.name,
      price_rub: tariff.price_rub,
      max_channels: tariff.max_channels,
      llm_model: tariff.llm_model,
      skills_access: tariff.skills_access,
      is_self_service: tariff.is_self_service,
      is_active: tariff.is_active,
    })
    setEditingTariffId(tariff.id)
    setShowTariffForm(true)
  }

  const handleSaveTariff = async (event: FormEvent) => {
    event.preventDefault()
    await runRequest(async () => {
      if (editingTariffId) {
        await updateAdminTariff(editingTariffId, tariffForm)
      } else {
        await createAdminTariff(tariffForm)
      }
      setShowTariffForm(false)
      setEditingTariffId(null)
      await loadData(1)
    })
  }

  const handleDeleteTariff = async (tariffId: string) => {
    await runRequest(async () => {
      await deleteAdminTariff(tariffId)
      await loadData(1)
    })
  }

  useEffect(() => {
    if (!isAuthenticated) return
    setPage(1)
    setListData(null)
    setStatsData(null)
    setServerLogsData(null)
    setShowTariffForm(false)
    setSelectedSupportRequest(null)
    void loadData(1)
  }, [activeTab, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="admin-auth-wrap">
        <Card>
          <h1 className="admin-auth-title">Вход в админку</h1>
          <form className="admin-login-form" onSubmit={handleLogin}>
            <Input
              label="Логин"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
            />
            <Input
              label="Пароль"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
            />
            <Button type="submit" loading={loading}>Войти</Button>
          </form>
          {error && <ErrorBanner message={error} />}
        </Card>
      </div>
    )
  }

  const userColumns: AdminTableColumn<AdminUserListItem>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (user) => (
        <button
          type="button"
          className="admin-id-link"
          onClick={() => navigate(`/admin/users/${user.id}`, { state: { user } })}
        >
          {shortId(user.id)}
        </button>
      ),
    },
    { key: 'email', header: 'Email', render: (user) => user.email },
    { key: 'name', header: 'Имя', render: (user) => user.name || '—' },
    { key: 'role', header: 'Роль', render: (user) => user.role },
    { key: 'active', header: 'Активен', render: (user) => (user.is_active ? 'Да' : 'Нет') },
    { key: 'created', header: 'Создан', render: (user) => formatDate(user.created_at) },
  ]

  const serverColumns: AdminTableColumn<AdminServerListItem>[] = [
    { key: 'id', header: 'ID', render: (server) => shortId(server.id) },
    { key: 'agent', header: 'Agent ID', render: (server) => shortId(server.agent_id) },
    { key: 'status', header: 'Статус', render: (server) => server.status },
    { key: 'ip', header: 'IP', render: (server) => server.ip_address || '—' },
    { key: 'created', header: 'Создан', render: (server) => formatDate(server.created_at) },
    {
      key: 'logs',
      header: '',
      render: (server) => (
        <button
          type="button"
          className="admin-id-link"
          onClick={() => {
            if (!server.id) return
            void loadServerLogs(server.id, 1)
          }}
        >
          Логи
        </button>
      ),
    },
  ]

  const logColumns: AdminTableColumn<ServerLogItem>[] = [
    { key: 'id', header: 'ID', render: (log) => shortId(log.id) },
    { key: 'level', header: 'Уровень', render: (log) => log.level },
    { key: 'stage', header: 'Этап', render: (log) => log.stage || '—' },
    { key: 'message', header: 'Сообщение', render: (log) => log.message },
    { key: 'created', header: 'Время', render: (log) => formatDate(log.created_at) },
  ]

  const agentColumns: AdminTableColumn<AdminAgentListItem>[] = [
    { key: 'id', header: 'ID', render: (agent) => shortId(agent.id) },
    { key: 'user', header: 'User ID', render: (agent) => shortId(agent.user_id) },
    { key: 'status', header: 'Статус', render: (agent) => agent.status },
    { key: 'step', header: 'Шаг onboarding', render: (agent) => agent.onboarding_step },
    { key: 'created', header: 'Создан', render: (agent) => formatDate(agent.created_at) },
  ]

  const requestColumns: AdminTableColumn<AdminSupportRequestItem>[] = [
    {
      key: 'id',
      header: 'ID',
      render: (request) => (
        <button
          type="button"
          className="admin-id-link"
          onClick={() => setSelectedSupportRequest(request)}
        >
          {shortId(request.id)}
        </button>
      ),
    },
    { key: 'user', header: 'User ID', render: (request) => shortId(request.user_id) },
    { key: 'topic', header: 'Тема', render: (request) => request.topic },
    {
      key: 'description',
      header: 'Описание',
      render: (request) => <span className="admin-description-preview">{descriptionPreview(request?.description)}</span>,
    },
    { key: 'method', header: 'Канал', render: (request) => request.contact_method },
    { key: 'contact', header: 'Контакт', render: (request) => request.contact },
    { key: 'status', header: 'Статус', render: (request) => request.status },
    { key: 'created', header: 'Создана', render: (request) => formatDate(request.created_at) },
  ]

  const otpColumns: AdminTableColumn<AdminOTPCodeItem>[] = [
    { key: 'id', header: 'ID', render: (otp) => shortId(otp.id) },
    { key: 'email', header: 'Email', render: (otp) => otp.email },
    { key: 'code', header: 'Код', render: (otp) => otp.code },
    { key: 'used', header: 'Использован', render: (otp) => (otp.is_used ? 'Да' : 'Нет') },
    { key: 'expires', header: 'Истекает', render: (otp) => formatDate(otp.expires_at) },
    { key: 'created', header: 'Создан', render: (otp) => formatDate(otp.created_at) },
  ]

  const tariffColumns: AdminTableColumn<AdminTariffListItem>[] = [
    { key: 'id', header: 'ID', render: (t) => shortId(t.id) },
    { key: 'slug', header: 'Slug', render: (t) => t.slug },
    { key: 'name', header: 'Название', render: (t) => t.name },
    { key: 'price', header: 'Цена (коп.)', render: (t) => t.price_rub },
    { key: 'channels', header: 'Каналы', render: (t) => t.max_channels ?? '—' },
    { key: 'llm', header: 'LLM', render: (t) => t.llm_model || '—' },
    { key: 'skills', header: 'Навыки', render: (t) => t.skills_access },
    { key: 'active', header: 'Активен', render: (t) => (t.is_active ? 'Да' : 'Нет') },
    {
      key: 'actions',
      header: '',
      render: (t) => (
        <span style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="admin-id-link" onClick={() => openEditTariff(t)}>
            Изм.
          </button>
          <button
            type="button"
            className="admin-id-link"
            style={{ color: '#c0392b' }}
            onClick={() => { if (confirm('Удалить тариф?')) void handleDeleteTariff(t.id) }}
          >
            Удал.
          </button>
        </span>
      ),
    },
  ]

  return (
    <div className="admin-page">
      <div className="admin-head">
        <h1>Администрирование</h1>
        <Button variant="secondary" onClick={handleLogout}>Выйти</Button>
      </div>

      <Card>
        <div className="admin-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`admin-tab${activeTab === tab.key ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      <Card className="mt-16">
        <div className="admin-controls">
          {activeTab === 'users' && (
            <Input
              label="Поиск"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="email или имя"
            />
          )}

          {activeTab === 'servers' && (
            <>
              <Input
                label="Статус"
                value={serverStatus}
                onChange={(event) => setServerStatus(event.target.value)}
                placeholder="active / error / provisioning"
              />
              <Input
                label="Уровень логов"
                value={logLevel}
                onChange={(event) => setLogLevel(event.target.value)}
                placeholder="info / warning / error"
              />
            </>
          )}

          {activeTab === 'custom_requests' && (
            <Input
              label="Статус"
              value={customStatus}
              onChange={(event) => setCustomStatus(event.target.value)}
              placeholder="new / in_progress / closed"
            />
          )}

          {activeTab === 'otp_codes' && (
            <Input
              label="Email"
              value={otpEmail}
              onChange={(event) => setOtpEmail(event.target.value)}
              placeholder="user@example.com"
            />
          )}

          {activeTab !== 'servers_stats' && activeTab !== 'tariffs' && (
            <Input
              label="ID"
              value={idSearch}
              onChange={(event) => setIdSearch(event.target.value)}
              placeholder="поиск по ID"
            />
          )}
        </div>

        {activeTab !== 'servers_stats' && activeTab !== 'tariffs' && (
          <div className="admin-actions">
            <Button onClick={() => loadData(1)} loading={loading}>Поиск</Button>
          </div>
        )}

        {activeTab === 'tariffs' && (
          <div className="admin-actions">
            <Button onClick={() => loadData(1)} loading={loading}>Обновить</Button>
            <Button variant="primary" onClick={openCreateTariff}>Создать тариф</Button>
          </div>
        )}
      </Card>

      {error && (
        <div className="mt-16">
          <ErrorBanner message={error} />
        </div>
      )}

      {statsData && (
        <Card className="mt-16">
          <div className="admin-stats-grid">
            <div className="admin-stat-card"><span>Всего</span><strong>{statsData.total}</strong></div>
            <div className="admin-stat-card"><span>Активные</span><strong>{statsData.active}</strong></div>
            <div className="admin-stat-card"><span>Provisioning</span><strong>{statsData.provisioning}</strong></div>
            <div className="admin-stat-card"><span>Ошибка</span><strong>{statsData.error}</strong></div>
            <div className="admin-stat-card"><span>Остановлены</span><strong>{statsData.stopped}</strong></div>
          </div>
        </Card>
      )}

      {activeTab === 'users' && listData && (
        <AdminTable
          title="Пользователи"
          columns={userColumns}
          rows={filterRowsById(listData.items as AdminUserListItem[])}
          rowKey={(row) => row.id}
        />
      )}

      {activeTab === 'servers' && listData && (
        <AdminTable
          title="Серверы"
          columns={serverColumns}
          rows={filterRowsById(listData.items as AdminServerListItem[])}
          rowKey={(row) => row.id}
        />
      )}

      {activeTab === 'servers' && serverLogsData && (
        <AdminTable
          title={`Логи сервера: ${selectedServerId}`}
          columns={logColumns}
          rows={filterRowsById(serverLogsData.items as ServerLogItem[])}
          rowKey={(row) => row.id}
          emptyText="Логи не найдены"
        />
      )}

      {activeTab === 'agents' && listData && (
        <AdminTable
          title="Агенты"
          columns={agentColumns}
          rows={filterRowsById(listData.items as AdminAgentListItem[])}
          rowKey={(row) => row.id}
        />
      )}

      {activeTab === 'custom_requests' && listData && (
        <AdminTable
          title="Заявки в поддержку"
          columns={requestColumns}
          rows={filterRowsById(listData.items as AdminSupportRequestItem[])}
          rowKey={(row) => row.id}
        />
      )}

      {activeTab === 'custom_requests' && selectedSupportRequest && (
        <Card className="mt-16 admin-support-detail">
          <div className="admin-head-actions">
            <h2 className="admin-section-title">Детали заявки</h2>
            <Button variant="secondary" onClick={() => setSelectedSupportRequest(null)}>Закрыть</Button>
          </div>
          <div className="admin-section-grid">
            <div>
              <p><strong>ID:</strong> {selectedSupportRequest.id}</p>
              <p><strong>User ID:</strong> {selectedSupportRequest.user_id}</p>
              <p><strong>Тема:</strong> {selectedSupportRequest.topic}</p>
              <p><strong>Канал:</strong> {selectedSupportRequest.contact_method}</p>
              <p><strong>Контакт:</strong> {selectedSupportRequest.contact}</p>
              <p><strong>Статус:</strong> {selectedSupportRequest.status}</p>
              <p><strong>Создана:</strong> {formatDate(selectedSupportRequest.created_at)}</p>
            </div>
            <div>
              <strong>Описание</strong>
              <pre>{selectedSupportRequest.description || '—'}</pre>
            </div>
          </div>
        </Card>
      )}

      {activeTab === 'otp_codes' && listData && (
        <AdminTable
          title="OTP-коды"
          columns={otpColumns}
          rows={filterRowsById(listData.items as AdminOTPCodeItem[])}
          rowKey={(row) => row.id}
        />
      )}

      {activeTab === 'tariffs' && listData && (
        <AdminTable
          title="Тарифы"
          columns={tariffColumns}
          rows={(listData.items as AdminTariffListItem[])}
          rowKey={(row) => row.id}
        />
      )}

      {activeTab === 'tariffs' && showTariffForm && (
        <Card className="mt-16">
          <h2 className="admin-section-title">
            {editingTariffId ? 'Редактирование тарифа' : 'Новый тариф'}
          </h2>
          <form className="admin-user-form" onSubmit={handleSaveTariff}>
            <Input
              label="Slug"
              value={tariffForm.slug}
              onChange={(e) => setTariffForm((prev) => ({ ...prev, slug: e.target.value }))}
            />
            <Input
              label="Название"
              value={tariffForm.name}
              onChange={(e) => setTariffForm((prev) => ({ ...prev, name: e.target.value }))}
            />
            <Input
              label="Цена (копейки)"
              type="number"
              value={String(tariffForm.price_rub)}
              onChange={(e) => setTariffForm((prev) => ({ ...prev, price_rub: Number(e.target.value) }))}
            />
            <Input
              label="Макс. каналов (пусто = без лимита)"
              value={tariffForm.max_channels != null ? String(tariffForm.max_channels) : ''}
              onChange={(e) => setTariffForm((prev) => ({
                ...prev,
                max_channels: e.target.value ? Number(e.target.value) : null,
              }))}
            />
            <Input
              label="LLM модель"
              value={tariffForm.llm_model || ''}
              onChange={(e) => setTariffForm((prev) => ({
                ...prev,
                llm_model: e.target.value || null,
              }))}
            />
            <div>
              <label className="form-label">Доступ к навыкам</label>
              <select
                className="form-input"
                value={tariffForm.skills_access}
                onChange={(e) => setTariffForm((prev) => ({ ...prev, skills_access: e.target.value }))}
              >
                <option value="basic">basic</option>
                <option value="all">all</option>
              </select>
            </div>
            <div>
              <label className="form-label">Self-service</label>
              <select
                className="form-input"
                value={String(tariffForm.is_self_service)}
                onChange={(e) => setTariffForm((prev) => ({ ...prev, is_self_service: e.target.value === 'true' }))}
              >
                <option value="true">Да</option>
                <option value="false">Нет</option>
              </select>
            </div>
            <div>
              <label className="form-label">Активен</label>
              <select
                className="form-input"
                value={String(tariffForm.is_active)}
                onChange={(e) => setTariffForm((prev) => ({ ...prev, is_active: e.target.value === 'true' }))}
              >
                <option value="true">Да</option>
                <option value="false">Нет</option>
              </select>
            </div>
            <div className="admin-actions">
              <Button type="submit" loading={loading}>Сохранить</Button>
              <Button
                variant="secondary"
                onClick={() => { setShowTariffForm(false); setEditingTariffId(null) }}
              >
                Отмена
              </Button>
            </div>
          </form>
        </Card>
      )}

      {isPaginatedResponse(listData) && activeTab !== 'servers_stats' && (
        <div className="admin-list-footer">
          <div className="admin-pagination">
            <button
              type="button"
              className="admin-page-arrow"
              onClick={() => loadData(Math.max(1, page - 1))}
              disabled={loading || page <= 1}
              aria-label="Предыдущая страница"
            >
              {'<'}
            </button>
            <span>
              {page} / {totalPages}
            </span>
            <button
              type="button"
              className="admin-page-arrow"
              onClick={() => loadData(Math.min(totalPages, page + 1))}
              disabled={loading || page >= totalPages}
              aria-label="Следующая страница"
            >
              {'>'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
