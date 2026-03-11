import { apiRequest } from './client'

// ── Встроенные типы (не из schema.ts) ────────────────────────────────────────

type SkillSummary = { id: string; slug: string; is_enabled: boolean }
type ToolSummary  = { id: string; slug: string; is_enabled: boolean }
type ChannelSummary = { id: string; type: string; status: string }
type ServerSummary  = { id: string; status: string; ip_address: string | null }

type AgentDetailResponse = {
  id: string
  status: string
  soul_md: string | null
  agent_md: string | null
  onboarding_step: number
  skills: SkillSummary[]
  tools: ToolSummary[]
  channels: ChannelSummary[]
  server: ServerSummary | null
}

type AsyncTaskAcceptedResponse = { task_id: string; status: string; message: string }
type AsyncTaskStatusResponse   = { task_id: string; status: string; result?: Record<string, unknown>; error?: string }
type OnboardingCompleteResponse = { status: string; task_id?: string | null }
type OnboardingConnectChannelResponse = { id: string; channel_type: string; status: string }
type OnboardingSelectSkillsResponse = { activated_skills: SkillSummary[] }
type MessageResponse = { message: string }

// ── Типы: настройки агента ────────────────────────────────────────────────────

export type AgentAboutData = {
  name: string | null
  location: string | null
  about_self: string | null
  occupation: string | null
  agent_restrictions: string | null
  user_md: string | null
  agent_md: string | null
  soul_md: string | null
  is_synchronized: boolean
}

export type AgentAboutRequest = {
  name?: string | null
  location?: string | null
  about_self?: string | null
  occupation?: string | null
  agent_restrictions?: string | null
}

export type AgentAboutResponse = AgentAboutData

// ── Агент ─────────────────────────────────────────────────────────────────────

/** Получить агента текущего пользователя (используется старыми страницами) */
export function getAgent(): Promise<AgentDetailResponse> {
  return apiRequest<AgentDetailResponse>('/agents/me')
}

/** Алиас для совместимости с новыми компонентами */
export const getAgentMe = getAgent

// ── Онбординг ─────────────────────────────────────────────────────────────────

export function onboardingDescribe(description: string): Promise<AsyncTaskAcceptedResponse> {
  return apiRequest<AsyncTaskAcceptedResponse>('/agents/onboarding/describe', {
    method: 'POST',
    body: JSON.stringify({ business_description: description }),
  })
}

export function onboardingSkipDescribe(): Promise<MessageResponse> {
  return apiRequest<MessageResponse>('/agents/onboarding/skip-describe', { method: 'POST' })
}

export function onboardingConnectChannel(
  channelType: string,
  config: Record<string, unknown>,
): Promise<OnboardingConnectChannelResponse> {
  return apiRequest<OnboardingConnectChannelResponse>('/agents/onboarding/connect-channel', {
    method: 'POST',
    body: JSON.stringify({ channel_type: channelType, config }),
  })
}

export function onboardingSelectSkills(
  skillIds?: string[],
  presetSlug?: string,
): Promise<OnboardingSelectSkillsResponse> {
  return apiRequest<OnboardingSelectSkillsResponse>('/agents/onboarding/select-skills', {
    method: 'POST',
    body: JSON.stringify({ skill_ids: skillIds, preset_slug: presetSlug || null }),
  })
}

export function onboardingComplete(): Promise<OnboardingCompleteResponse> {
  return apiRequest<OnboardingCompleteResponse>('/agents/onboarding/complete', { method: 'POST' })
}

// ── Статус задачи ─────────────────────────────────────────────────────────────

export function getTaskStatus(taskId: string): Promise<AsyncTaskStatusResponse> {
  return apiRequest<AsyncTaskStatusResponse>(`/agents/tasks/${taskId}/status`)
}

// ── Настройки агента (about) ──────────────────────────────────────────────────

export function getAgentAbout(): Promise<AgentAboutResponse> {
  return apiRequest<AgentAboutResponse>('/agents/me/about')
}

export function saveAgentAbout(data: AgentAboutRequest): Promise<AsyncTaskAcceptedResponse> {
  return apiRequest<AsyncTaskAcceptedResponse>('/agents/me/about', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}
