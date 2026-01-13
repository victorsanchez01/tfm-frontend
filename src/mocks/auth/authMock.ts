//
//  authMock.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { type RegisterInput, type LoginInput } from '@shared/validations/authSchemas'

export interface UserProfile {
  user_id: string
  auth_user_id: string
  email: string
  display_name: string
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  access_token: string
  refresh_token: string
  profile: UserProfile
}

const mockUsers: UserProfile[] = []

export async function mockRegister(input: RegisterInput): Promise<AuthResponse> {
  const existing = mockUsers.find(u => u.email === input.email)
  if (existing) {
    throw new Error('EMAIL_EXISTS')
  }

  const profile: UserProfile = {
    user_id: crypto.randomUUID(),
    auth_user_id: crypto.randomUUID(),
    email: input.email,
    display_name: `${input.firstName} ${input.lastName}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  mockUsers.push(profile)

  return {
    access_token: `mock-jwt-${profile.auth_user_id}`,
    refresh_token: `mock-refresh-${profile.auth_user_id}`,
    profile,
  }
}

export async function mockLogin(input: LoginInput): Promise<AuthResponse> {
  const profile = mockUsers.find(u => u.email === input.email)
  if (!profile) {
    throw new Error('INVALID_CREDENTIALS')
  }

  return {
    access_token: `mock-jwt-${profile.auth_user_id}`,
    refresh_token: `mock-refresh-${profile.auth_user_id}`,
    profile,
  }
}
