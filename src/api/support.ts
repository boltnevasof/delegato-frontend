import { apiRequest } from './client'

export type CreateSupportRequestPayload = {
  topic: string
  description: string
  contact_method: string
  contact: string
}

export type CreateSupportRequestResponse = {
  id: string
  status: string
  message: string
  created_at: string
}

export function createSupportRequest(
  payload: CreateSupportRequestPayload,
): Promise<CreateSupportRequestResponse> {
  return apiRequest<CreateSupportRequestResponse>('/support/requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
