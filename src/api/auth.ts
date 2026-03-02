import type { components } from './generated/schema'
import { apiRequest } from './client'

type OTPSendResponse = components['schemas']['OTPSendResponse']
type TokenResponse = components['schemas']['TokenResponse']

export function sendOtp(email: string): Promise<OTPSendResponse> {
  return apiRequest<OTPSendResponse>('/auth/email/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function verifyOtp(email: string, code: string): Promise<TokenResponse> {
  return apiRequest<TokenResponse>('/auth/email/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, code }),
  })
}

export function googleInitiateUrl(): string {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
  return `${base}/auth/google/initiate`
}

export function verifyTelegram(data: components['schemas']['TelegramAuthRequest']): Promise<TokenResponse> {
  return apiRequest<TokenResponse>('/auth/telegram/verify', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function refreshToken(token: string): Promise<TokenResponse> {
  return apiRequest<TokenResponse>('/auth/token/refresh', {
    method: 'POST',
    body: JSON.stringify({ refresh_token: token }),
  })
}
