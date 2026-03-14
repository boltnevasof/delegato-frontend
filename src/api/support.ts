import { apiRequest } from './client'

export type CreateSupportRequest = {
  topic: string
  description: string
  contact_method: string
  contact: string
}

export type SupportRequestResponse = {
  id: string
  status: string
  message: string
  created_at: string
}

export function createSupportRequest(data: CreateSupportRequest): Promise<SupportRequestResponse> {
  return apiRequest<SupportRequestResponse>('/support/requests', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
