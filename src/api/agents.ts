import type { components } from './generated/schema'
import { apiRequest } from './client'

type AgentDetailResponse = components['schemas']['AgentDetailResponse']
type AsyncTaskAcceptedResponse = components['schemas']['AsyncTaskAcceptedResponse']
type AsyncTaskStatusResponse = components['schemas']['AsyncTaskStatusResponse']
type OnboardingCompleteResponse = components['schemas']['OnboardingCompleteResponse']
type OnboardingConnectChannelResponse = components['schemas']['OnboardingConnectChannelResponse']
type OnboardingSelectSkillsResponse = components['schemas']['OnboardingSelectSkillsResponse']
type MessageResponse = components['schemas']['MessageResponse']

export function getAgent(): Promise<AgentDetailResponse> {
  return apiRequest<AgentDetailResponse>('/agents/me')
}

export function onboardingDescribe(description: string): Promise<AsyncTaskAcceptedResponse> {
  return apiRequest<AsyncTaskAcceptedResponse>('/agents/onboarding/describe', {
    method: 'POST',
    body: JSON.stringify({ business_description: description }),
  })
}

export function onboardingSkipDescribe(): Promise<MessageResponse> {
  return apiRequest<MessageResponse>('/agents/onboarding/skip-describe', {
    method: 'POST',
  })
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
    body: JSON.stringify({
      skill_ids: skillIds,
      preset_slug: presetSlug || null,
    }),
  })
}

export function onboardingComplete(): Promise<OnboardingCompleteResponse> {
  return apiRequest<OnboardingCompleteResponse>('/agents/onboarding/complete', {
    method: 'POST',
  })
}

export function getTaskStatus(taskId: string): Promise<AsyncTaskStatusResponse> {
  return apiRequest<AsyncTaskStatusResponse>(`/agents/tasks/${taskId}/status`)
}

export function updateSoulMd(content: string): Promise<MessageResponse> {
  return apiRequest<MessageResponse>('/agents/me/soul-md', {
    method: 'PUT',
    body: JSON.stringify({ content }),
  })
}

export function updateAgentMd(content: string): Promise<MessageResponse> {
  return apiRequest<MessageResponse>('/agents/me/agent-md', {
    method: 'PUT',
    body: JSON.stringify({ content }),
  })
}

export function enhance(field: string, content: string): Promise<AsyncTaskAcceptedResponse> {
  return apiRequest<AsyncTaskAcceptedResponse>('/agents/me/enhance', {
    method: 'POST',
    body: JSON.stringify({ field, content }),
  })
}
