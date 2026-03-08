//
//  authService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { httpClient, USE_REAL_API, setAuthHeader, clearAuthHeader, KEYCLOAK_URL } from '../api/httpClient'
import { type RegisterInput, type LoginInput } from '@shared/validations/authSchemas'
import { mockRegister, mockLogin, type AuthResponse, type UserProfile } from '@mocks/auth/authMock'

// Backend DTOs
interface BackendRegisterRequest {
  email: string
  password: string
  displayName: string
  locale?: string
  timezone?: string
}

interface BackendRegisterResponse {
  userId: string
  authUserId: string
  email: string
  displayName: string
  locale?: string
  timezone?: string
  createdAt: string
  updatedAt: string
}

interface KeycloakTokenResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  token_type: string
}

interface BackendProfileResponse {
  userId: string
  authUserId: string
  email: string
  displayName: string
  locale?: string
  timezone?: string
  createdAt: string
  updatedAt: string
}

// Backend API functions
const registerAPI = async (input: RegisterInput): Promise<AuthResponse> => {
  const backendRequest: BackendRegisterRequest = {
    email: input.email,
    password: input.password,
    displayName: `${input.firstName} ${input.lastName}`,
  }

  const response = await httpClient.post<BackendRegisterResponse>('/auth/register', backendRequest)

  // Registration successful — no tokens issued. Return minimal auth response.
  return {
    access_token: '',
    refresh_token: '',
    profile: {
      user_id: response.userId,
      auth_user_id: response.authUserId,
      email: response.email,
      display_name: response.displayName,
      created_at: response.createdAt,
      updated_at: response.updatedAt,
    },
  }
}

const loginAPI = async (input: LoginInput): Promise<AuthResponse> => {
  // Step 1: Authenticate with Keycloak using Resource Owner Password Credentials
  const keycloakUrl = `${KEYCLOAK_URL}/realms/learnsmart/protocol/openid-connect/token`
  const formBody = new URLSearchParams({
    grant_type: 'password',
    client_id: 'learnsmart-frontend',
    username: input.email,
    password: input.password,
  })

  const keycloakResponse = await fetch(keycloakUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formBody.toString(),
  })

  if (!keycloakResponse.ok) {
    const err = await keycloakResponse.json().catch(() => ({}))
    throw new Error(err.error_description || 'Credenciales incorrectas')
  }

  const tokens: KeycloakTokenResponse = await keycloakResponse.json()

  // Step 2: Save tokens
  localStorage.setItem('tfm_access_token', tokens.access_token)
  localStorage.setItem('tfm_refresh_token', tokens.refresh_token)

  // Step 3: Decode JWT to get authUserId (sub claim)
  const payloadBase64 = tokens.access_token.split('.')[1]
  const payload = JSON.parse(atob(payloadBase64))
  const authUserId: string = payload.sub

  // Step 4: Fetch profile from backend using the JWT
  // Temporarily set auth header so httpClient can make the request
  httpClient.defaultHeaders['Authorization'] = `Bearer ${tokens.access_token}`
  const profile = await httpClient.get<BackendProfileResponse>('/profiles/me')

  // Step 5: Persist user data and set auth header
  localStorage.setItem('user_id', profile.userId)
  localStorage.setItem('display_name', profile.displayName)
  localStorage.setItem('email', profile.email)
  setAuthHeader(profile.userId)

  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    profile: {
      user_id: profile.userId,
      auth_user_id: authUserId,
      email: profile.email,
      display_name: profile.displayName,
      created_at: profile.createdAt,
      updated_at: profile.updatedAt,
    },
  }
}

const getProfileAPI = async (): Promise<UserProfile> => {
  const response = await httpClient.get<BackendProfileResponse>('/profiles/me')
  return {
    user_id: response.userId,
    auth_user_id: response.authUserId,
    email: response.email,
    display_name: response.displayName,
    created_at: response.createdAt,
    updated_at: response.updatedAt,
  }
}

const mockGetProfile = async (): Promise<UserProfile> => {
  const token = localStorage.getItem('tfm_access_token')
  if (!token) throw new Error('No token found')

  return {
    user_id: 'mock-user-id',
    auth_user_id: 'mock-auth-id',
    email: 'mock@example.com',
    display_name: 'Mock User',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

// Export adapter functions
export const register = USE_REAL_API ? registerAPI : mockRegister
export const login = USE_REAL_API ? loginAPI : mockLogin
export const getProfile = USE_REAL_API ? getProfileAPI : mockGetProfile

// Re-export UserProfile for other components
export type { UserProfile } from '@mocks/auth/authMock'

// Helper para restaurar auth header al cargar la app
export const restoreAuthSession = () => {
  const token = localStorage.getItem('tfm_access_token')
  if (token && USE_REAL_API) {
    const userId = localStorage.getItem('user_id')
    if (userId) {
      setAuthHeader(userId)
    }
  }
}

// Legacy functions for compatibility
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
  localStorage.removeItem('user_id')
  localStorage.removeItem('display_name')
  localStorage.removeItem('email')
  clearAuthHeader()
}
