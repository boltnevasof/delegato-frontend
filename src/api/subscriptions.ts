import type { components } from './generated/schema'
import { apiRequest } from './client'

type SubscriptionDetailResponse = components['schemas']['SubscriptionDetailResponse']
type ChangeTariffResponse = components['schemas']['ChangeTariffResponse']
type CancelSubscriptionResponse = components['schemas']['CancelSubscriptionResponse']
type ReactivateResponse = components['schemas']['ReactivateResponse']

export function getCurrent(): Promise<SubscriptionDetailResponse> {
  return apiRequest<SubscriptionDetailResponse>('/subscriptions/current')
}

export function changeTariff(tariffId: string): Promise<ChangeTariffResponse> {
  return apiRequest<ChangeTariffResponse>('/subscriptions/change-tariff', {
    method: 'POST',
    body: JSON.stringify({ tariff_id: tariffId }),
  })
}

export function cancel(reason: string): Promise<CancelSubscriptionResponse> {
  return apiRequest<CancelSubscriptionResponse>('/subscriptions/cancel', {
    method: 'POST',
    body: JSON.stringify({ reason }),
  })
}

export function reactivate(): Promise<ReactivateResponse> {
  return apiRequest<ReactivateResponse>('/subscriptions/reactivate', {
    method: 'POST',
  })
}
