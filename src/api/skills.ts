import type { components } from './generated/schema'
import { apiRequest } from './client'

type SkillCatalogResponse = components['schemas']['SkillCatalogResponse']
type AgentSkillResponse = components['schemas']['AgentSkillResponse']

export function getCatalog(): Promise<SkillCatalogResponse> {
  return apiRequest<SkillCatalogResponse>('/skills/catalog')
}

export function addSkill(skillId: string): Promise<AgentSkillResponse> {
  return apiRequest<AgentSkillResponse>('/agents/me/skills', {
    method: 'POST',
    body: JSON.stringify({ skill_id: skillId }),
  })
}

export function toggleSkill(id: string, isEnabled: boolean): Promise<AgentSkillResponse> {
  return apiRequest<AgentSkillResponse>(`/agents/me/skills/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_enabled: isEnabled }),
  })
}

export function removeSkill(id: string): Promise<void> {
  return apiRequest<void>(`/agents/me/skills/${id}`, {
    method: 'DELETE',
  })
}
