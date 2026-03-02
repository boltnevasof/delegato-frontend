import type { components } from './generated/schema'
import { apiRequest } from './client'

type ChannelListResponse = components['schemas']['ChannelListResponse']
type ChannelResponse = components['schemas']['ChannelResponse']

export function getChannels(): Promise<ChannelListResponse> {
  return apiRequest<ChannelListResponse>('/agents/me/channels')
}

export function updateChannel(id: string, status: string): Promise<ChannelResponse> {
  return apiRequest<ChannelResponse>(`/agents/me/channels/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}
