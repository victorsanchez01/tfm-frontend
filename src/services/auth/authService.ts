//
//  authService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { mockRegister, mockLogin } from '@mocks/auth/authMock'
import { type RegisterInput, type LoginInput } from '@shared/validations/authSchemas'
import { type AuthResponse } from '@mocks/auth/authMock'

export async function register(input: RegisterInput): Promise<AuthResponse> {
  await new Promise(r => setTimeout(r, 800))
  return mockRegister(input)
}

export async function login(input: LoginInput): Promise<AuthResponse> {
  await new Promise(r => setTimeout(r, 600))
  return mockLogin(input)
}

export function storeTokens(tokens: { access_token: string; refresh_token: string }) {
  localStorage.setItem('tfm_access_token', tokens.access_token)
  localStorage.setItem('tfm_refresh_token', tokens.refresh_token)
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem('tfm_access_token')
}

export function clearTokens() {
  localStorage.removeItem('tfm_access_token')
  localStorage.removeItem('tfm_refresh_token')
}
