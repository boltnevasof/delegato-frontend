import type { components } from './generated/schema'
import { apiRequest } from './client'

type TariffListResponse = components['schemas']['TariffListResponse']

export function getTariffs(): Promise<TariffListResponse> {
  return apiRequest<TariffListResponse>('/tariffs')
}
