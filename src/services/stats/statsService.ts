//
//  statsService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { httpClient, USE_REAL_API } from '../api/httpClient'

export interface StudyTimeData {
  date: string
  minutes: number
}

export interface ProgressData {
  category: string
  completed: number
  total: number
  percentage: number
}

export interface ActivityData {
  date: string
  activities: number
}

export interface MonthlyProgressData {
  month: string
  totalHours: number
  progressPercentage: number
  completedContents: number
}

export interface StatsOverview {
  totalStudyTime: number // in minutes
  streakDays: number
  completedCourses: number
  inProgressCourses: number
  weeklyGoal: number
  weeklyProgress: number
}

// Backend DTOs
interface BackendStats {
  totalHours: number
  completedActivities: number
  currentStreak: number
}

interface BackendDailyActivity {
  date: string
  minutesStudied: number
  activitiesCount: number
}

// Real API implementation
const getOverviewAPI = async (): Promise<StatsOverview> => {
  const userId = localStorage.getItem('user_id') || ''
  const stats = await httpClient
    .get<BackendStats>(`/tracking/analytics/users/${userId}/stats`)
    .catch(() => ({ totalHours: 0, completedActivities: 0, currentStreak: 0 }))

  return {
    totalStudyTime: Math.round(stats.totalHours * 60),
    streakDays: stats.currentStreak,
    completedCourses: stats.completedActivities,
    inProgressCourses: 0,
    weeklyGoal: 600,
    weeklyProgress: 0,
  }
}

const getStudyTimeAPI = async (days: number = 30): Promise<StudyTimeData[]> => {
  const userId = localStorage.getItem('user_id') || ''
  const to = new Date().toISOString().split('T')[0]
  const from = new Date(Date.now() - days * 86400000).toISOString().split('T')[0]

  const activities = await httpClient
    .get<BackendDailyActivity[]>(
      `/tracking/analytics/users/${userId}/activity?from=${from}&to=${to}`
    )
    .catch(() => [] as BackendDailyActivity[])

  return (Array.isArray(activities) ? activities : []).map(a => ({
    date: a.date,
    minutes: a.minutesStudied || 0,
  }))
}

const getWeeklyActivityAPI = async (): Promise<ActivityData[]> => {
  const userId = localStorage.getItem('user_id') || ''
  const to = new Date().toISOString().split('T')[0]
  const from = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

  const activities = await httpClient
    .get<BackendDailyActivity[]>(
      `/tracking/analytics/users/${userId}/activity?from=${from}&to=${to}`
    )
    .catch(() => [] as BackendDailyActivity[])

  return (Array.isArray(activities) ? activities : []).map(a => ({
    date: new Date(a.date).toLocaleDateString('es', { weekday: 'short' }),
    activities: a.activitiesCount || 0,
  }))
}

// Mock generators
const generateMockStudyTime = (): StudyTimeData[] => {
  const data: StudyTimeData[] = []
  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      minutes: Math.floor(Math.random() * 120) + 20,
    })
  }
  return data
}

const generateMockActivity = (): ActivityData[] => {
  const data: ActivityData[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toLocaleDateString('es', { weekday: 'short' }),
      activities: Math.floor(Math.random() * 8) + 1,
    })
  }
  return data
}

const generateMockMonthlyProgress = (): MonthlyProgressData[] => {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
  return months.map(month => ({
    month,
    totalHours: Math.floor(Math.random() * 40) + 10,
    progressPercentage: Math.floor(Math.random() * 40) + 60,
    completedContents: Math.floor(Math.random() * 5) + 2,
  }))
}

export const statsService = {
  async getOverview(): Promise<StatsOverview> {
    if (USE_REAL_API) return getOverviewAPI()
    await new Promise(resolve => setTimeout(resolve, 300))
    return {
      totalStudyTime: 2450,
      streakDays: 12,
      completedCourses: 2,
      inProgressCourses: 3,
      weeklyGoal: 600,
      weeklyProgress: 420,
    }
  },

  async getStudyTime(days: number = 30): Promise<StudyTimeData[]> {
    if (USE_REAL_API) return getStudyTimeAPI(days)
    await new Promise(resolve => setTimeout(resolve, 400))
    return generateMockStudyTime().slice(-days)
  },

  async getProgressByCategory(): Promise<ProgressData[]> {
    // No backend equivalent — return mock
    await new Promise(resolve => setTimeout(resolve, 350))
    return [
      { category: 'Frontend', completed: 3, total: 5, percentage: 60 },
      { category: 'Backend', completed: 1, total: 3, percentage: 33 },
      { category: 'Lenguajes', completed: 2, total: 4, percentage: 50 },
      { category: 'CSS', completed: 4, total: 4, percentage: 100 },
      { category: 'Python', completed: 0, total: 2, percentage: 0 },
    ]
  },

  async getWeeklyActivity(): Promise<ActivityData[]> {
    if (USE_REAL_API) return getWeeklyActivityAPI()
    await new Promise(resolve => setTimeout(resolve, 200))
    return generateMockActivity()
  },

  async getMonthlyProgress(): Promise<MonthlyProgressData[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return generateMockMonthlyProgress()
  },
}
