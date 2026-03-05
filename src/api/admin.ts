import type { components } from './generated/schema'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
const ADMIN_ACCESS_TOKEN_KEY = 'admin_access_token'

type AdminError = {
  status: number
  message: string
  detail?: components['schemas']['ValidationError'][]
}

type AdminLoginRequest = components['schemas']['AdminLoginRequest']
type AdminLoginResponse = components['schemas']['AdminLoginResponse']
type AdminUserListResponse = components['schemas']['AdminUserListResponse']
type AdminServerListResponse = components['schemas']['AdminServerListResponse']
type AdminServerStats = components['schemas']['AdminServerStats']
type ServerLogListResponse = components['schemas']['ServerLogListResponse']
type AdminAgentListResponse = components['schemas']['AdminAgentListResponse']
type AdminCustomRequestListResponse = components['schemas']['AdminCustomRequestListResponse']
type AdminUpdateUserRequest = components['schemas']['AdminUpdateUserRequest']
type AdminUpdateUserResponse = components['schemas']['AdminUpdateUserResponse']
type AdminOTPCodeListResponse = components['schemas']['AdminOTPCodeListResponse']

// Tariff types (manual — not yet in generated schema)
export type AdminTariffListItem = {
  id: string
  slug: string
  name: string
  price_rub: number
  max_channels: number | null
  llm_model: string | null
  skills_access: string
  is_self_service: boolean
  is_active: boolean
  created_at: string
}

export type AdminTariffListResponse = {
  items: AdminTariffListItem[]
  total: number
  page: number
  per_page: number
}

export type AdminSupportRequestItem = {
  id: string
  user_id: string
  topic: string
  description: string
  contact_method: string
  contact: string
  status: string
  created_at: string
}

export type AdminSupportRequestListResponse = {
  items: AdminSupportRequestItem[]
  total: number
  page: number
  per_page: number
}

export type AdminTariffResponse = AdminTariffListItem

export type AdminCreateTariffRequest = {
  slug: string
  name: string
  price_rub: number
  max_channels?: number | null
  llm_model?: string | null
  skills_access?: string
  is_self_service?: boolean
  is_active?: boolean
}

export type AdminUpdateTariffRequest = {
  slug?: string
  name?: string
  price_rub?: number
  max_channels?: number | null
  llm_model?: string | null
  skills_access?: string
  is_self_service?: boolean
  is_active?: boolean
}

export type AdminUserSubscriptionResponse = {
  subscription_id: string | null
  tariff_plan_id: string | null
  tariff_name: string | null
  status: string | null
}

let adminAccessToken: string | null = localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY)

export function getAdminAccessToken(): string | null {
  return adminAccessToken
}

export function setAdminAccessToken(token: string): void {
  adminAccessToken = token
  localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, token)
}

export function clearAdminAccessToken(): void {
  adminAccessToken = null
  localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY)
}

export async function adminLogin(payload: AdminLoginRequest): Promise<AdminLoginResponse> {
  const data = await adminRequest<AdminLoginResponse>('/admin/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, false)

  setAdminAccessToken(data.access_token)
  return data
}

export function listAdminUsers(
  page = 1,
  perPage = 20,
  search?: string,
): Promise<AdminUserListResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (search) params.set('search', search)
  return adminRequest<AdminUserListResponse>(`/admin/users?${params.toString()}`)
}

export function listAdminServers(
  page = 1,
  perPage = 20,
  status?: string,
): Promise<AdminServerListResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (status) params.set('status', status)
  return adminRequest<AdminServerListResponse>(`/admin/servers?${params.toString()}`)
}

export function getAdminServerStats(): Promise<AdminServerStats> {
  return adminRequest<AdminServerStats>('/admin/servers/stats')
}

export function getAdminServerLogs(
  serverId: string,
  page = 1,
  perPage = 20,
  level?: string,
): Promise<ServerLogListResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (level) params.set('level', level)
  return adminRequest<ServerLogListResponse>(`/admin/servers/${serverId}/logs?${params.toString()}`)
}

export function listAdminAgents(page = 1, perPage = 20): Promise<AdminAgentListResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  return adminRequest<AdminAgentListResponse>(`/admin/agents?${params.toString()}`)
}

export function listAdminCustomRequests(
  page = 1,
  perPage = 20,
  status?: string,
): Promise<AdminCustomRequestListResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (status) params.set('status', status)
  return adminRequest<AdminCustomRequestListResponse>(`/admin/custom-requests?${params.toString()}`)
}

export function listAdminSupportRequests(
  page = 1,
  perPage = 20,
  status?: string,
): Promise<AdminSupportRequestListResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (status) params.set('status', status)
  return adminRequest<AdminSupportRequestListResponse>(`/admin/support-requests?${params.toString()}`)
}

export function updateAdminUser(
  userId: string,
  payload: AdminUpdateUserRequest,
): Promise<AdminUpdateUserResponse> {
  return adminRequest<AdminUpdateUserResponse>(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function listAdminOtpCodes(
  page = 1,
  perPage = 20,
  email?: string,
): Promise<AdminOTPCodeListResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  if (email) params.set('email', email)
  return adminRequest<AdminOTPCodeListResponse>(`/admin/otp-codes?${params.toString()}`)
}

// --- Tariff CRUD ---

export function listAdminTariffs(
  page = 1,
  perPage = 20,
): Promise<AdminTariffListResponse> {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) })
  return adminRequest<AdminTariffListResponse>(`/admin/tariffs?${params.toString()}`)
}

export function createAdminTariff(
  payload: AdminCreateTariffRequest,
): Promise<AdminTariffResponse> {
  return adminRequest<AdminTariffResponse>('/admin/tariffs', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateAdminTariff(
  tariffId: string,
  payload: AdminUpdateTariffRequest,
): Promise<AdminTariffResponse> {
  return adminRequest<AdminTariffResponse>(`/admin/tariffs/${tariffId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function deleteAdminTariff(tariffId: string): Promise<void> {
  return adminRequest<void>(`/admin/tariffs/${tariffId}`, {
    method: 'DELETE',
  })
}

// --- User subscription ---

export function getAdminUserSubscription(
  userId: string,
): Promise<AdminUserSubscriptionResponse> {
  return adminRequest<AdminUserSubscriptionResponse>(`/admin/users/${userId}/subscription`)
}

export function assignAdminUserTariff(
  userId: string,
  tariffPlanId: string,
): Promise<AdminUserSubscriptionResponse> {
  return adminRequest<AdminUserSubscriptionResponse>(`/admin/users/${userId}/assign-tariff`, {
    method: 'POST',
    body: JSON.stringify({ tariff_plan_id: tariffPlanId }),
  })
}

async function adminRequest<T>(
  path: string,
  options: RequestInit = {},
  withAuth = true,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  }

  if (withAuth && adminAccessToken) {
    headers['Authorization'] = `Bearer ${adminAccessToken}`
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      clearAdminAccessToken()
    }
    throw await parseError(response)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

async function parseError(response: Response): Promise<AdminError> {
  try {
    const body = await response.json()

    if (Array.isArray(body.detail)) {
      return {
        status: response.status,
        message: body.detail.map((d: { msg: string }) => d.msg).join('; '),
        detail: body.detail,
      }
    }

    return {
      status: response.status,
      message: body.message || body.detail || `Error ${response.status}`,
    }
  } catch {
    return {
      status: response.status,
      message: `Error ${response.status}`,
    }
  }
}
