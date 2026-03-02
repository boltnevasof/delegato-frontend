import type { components } from './generated/schema'
import { apiRequest } from './client'

type UserProfileResponse = components['schemas']['UserProfileResponse']

export function getMe(): Promise<UserProfileResponse> {
  return apiRequest<UserProfileResponse>('/users/me')
}
