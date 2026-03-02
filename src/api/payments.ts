import type { components } from './generated/schema'
import { apiRequest } from './client'

type SubscribeResponse = components['schemas']['SubscribeResponse']
type PaymentHistoryResponse = components['schemas']['PaymentHistoryResponse']

export function subscribe(tariffId: string): Promise<SubscribeResponse> {
  return apiRequest<SubscribeResponse>('/payments/subscribe', {
    method: 'POST',
    body: JSON.stringify({ tariff_id: tariffId }),
  })
}

export function getHistory(page = 1, perPage = 20): Promise<PaymentHistoryResponse> {
  return apiRequest<PaymentHistoryResponse>(`/payments/history?page=${page}&per_page=${perPage}`)
}
