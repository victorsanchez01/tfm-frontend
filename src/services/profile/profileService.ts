//
//  profileService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { httpClient, USE_REAL_API } from '../api/httpClient'

export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  bio?: string
  location?: string
  website?: string
  joinedAt: string
  stats: {
    completedCourses: number
    totalHours: number
    streak: number
    certificates: number
  }
}

interface UpdateProfileData {
  firstName: string
  lastName: string
  bio?: string
  location?: string
  website?: string
}

// Backend DTOs
interface BackendProfile {
  userId: string
  authUserId: string
  email: string
  displayName: string
  locale?: string
  timezone?: string
  createdAt: string
  updatedAt: string
}

interface BackendStats {
  totalHours: number
  completedActivities: number
  currentStreak: number
}

interface BackendUpdateRequest {
  displayName?: string
  locale?: string
  timezone?: string
}

const LOCAL_PROFILE_KEY = 'tfm_profile_extra'

const loadLocalExtras = () => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_PROFILE_KEY) || '{}')
  } catch {
    return {}
  }
}

const saveLocalExtras = (data: { bio?: string; location?: string; website?: string; avatar?: string }) => {
  const existing = loadLocalExtras()
  localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify({ ...existing, ...data }))
}

const adaptProfile = (backend: BackendProfile, stats: BackendStats): UserProfile => {
  const parts = backend.displayName.split(' ')
  const firstName = parts[0] || ''
  const lastName = parts.slice(1).join(' ') || ''
  const extras = loadLocalExtras()

  return {
    id: backend.userId,
    firstName,
    lastName,
    email: backend.email,
    bio: extras.bio || '',
    location: extras.location || '',
    website: extras.website || '',
    avatar: extras.avatar,
    joinedAt: backend.createdAt.split('T')[0],
    stats: {
      completedCourses: stats.completedActivities,
      totalHours: Math.round(stats.totalHours),
      streak: stats.currentStreak,
      certificates: 0,
    },
  }
}

// Real API implementation
const getProfileAPI = async (): Promise<UserProfile> => {
  const userId = localStorage.getItem('user_id') || ''
  const [profile, stats] = await Promise.all([
    httpClient.get<BackendProfile>('/profiles/me'),
    userId
      ? httpClient.get<BackendStats>(`/tracking/analytics/users/${userId}/stats`).catch(() => ({
          totalHours: 0,
          completedActivities: 0,
          currentStreak: 0,
        }))
      : Promise.resolve({ totalHours: 0, completedActivities: 0, currentStreak: 0 }),
  ])
  return adaptProfile(profile, stats)
}

const updateProfileAPI = async (data: UpdateProfileData): Promise<UserProfile> => {
  const displayName = `${data.firstName} ${data.lastName}`.trim()
  const updateRequest: BackendUpdateRequest = { displayName }
  await httpClient.put<BackendProfile>('/profiles/me', updateRequest)
  localStorage.setItem('display_name', displayName)
  saveLocalExtras({ bio: data.bio, location: data.location, website: data.website })
  return getProfileAPI()
}

// Mock implementation
const mockProfileData: UserProfile = {
  id: '1',
  firstName: 'Victor',
  lastName: 'Sanchez',
  email: 'victor@example.com',
  bio: 'Desarrollador apasionado por aprender nuevas tecnologías',
  location: 'Madrid, España',
  website: 'https://victorsanchez.dev',
  joinedAt: '2024-01-15',
  stats: {
    completedCourses: 12,
    totalHours: 156,
    streak: 15,
    certificates: 8,
  },
}

export const profileService = {
  async getProfile(): Promise<UserProfile> {
    if (USE_REAL_API) return getProfileAPI()
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockProfileData
  },

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    if (USE_REAL_API) return updateProfileAPI(data)
    await new Promise(resolve => setTimeout(resolve, 800))
    Object.assign(mockProfileData, data)
    return { ...mockProfileData }
  },

  async uploadAvatar(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        saveLocalExtras({ avatar: dataUrl })
        resolve(dataUrl)
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  },
}
