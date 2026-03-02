import type { components } from './generated/schema'
import { apiRequest } from './client'

type ToolCatalogResponse = components['schemas']['ToolCatalogResponse']
type AgentToolResponse = components['schemas']['AgentToolResponse']

export function getCatalog(): Promise<ToolCatalogResponse> {
  return apiRequest<ToolCatalogResponse>('/tools/catalog')
}

export function addTool(toolId: string): Promise<AgentToolResponse> {
  return apiRequest<AgentToolResponse>('/agents/me/tools', {
    method: 'POST',
    body: JSON.stringify({ tool_id: toolId }),
  })
}

export function toggleTool(id: string, isEnabled: boolean): Promise<AgentToolResponse> {
  return apiRequest<AgentToolResponse>(`/agents/me/tools/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_enabled: isEnabled }),
  })
}

export function removeTool(id: string): Promise<void> {
  return apiRequest<void>(`/agents/me/tools/${id}`, {
    method: 'DELETE',
  })
}
