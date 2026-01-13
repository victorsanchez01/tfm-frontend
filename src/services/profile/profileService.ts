//
//  profileService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

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

const mockProfile: UserProfile = {
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
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return mockProfile
  },

  async updateProfile(data: UpdateProfileData): Promise<UserProfile> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Update mock data
    Object.assign(mockProfile, data)
    return { ...mockProfile }
  },

  async uploadAvatar(): Promise<string> {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Return mock URL
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`
  },
}
