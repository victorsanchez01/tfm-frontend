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

// Backend DTOs — campos reales de UserStatsResponse y DailyActivityResponse Java
interface BackendStats {
  totalHours: number
  lessonsCompleted: number   // ⚠️ NO es 'completedActivities'
  assessmentsTaken: number
  currentStreak: number
  totalEvents: number
}

interface BackendDailyActivity {
  date: string
  hoursStudied: number       // ⚠️ NO es 'minutesStudied' — viene en horas
  eventCount: number         // ⚠️ NO es 'activitiesCount'
}

interface BackendEvent {
  id: string
  eventType: string
  entityId: string
  occurredAt: string
}

interface BackendEventPage {
  content: BackendEvent[]
}

interface BackendContentItem {
  id: string
  title: string
}

export interface CompletedContentItem {
  id: string
  title: string
}

const fetchContentStatusCounts = async (userId: string) => {
  const page = await httpClient
    .get<BackendEventPage>(`/tracking/events?userId=${userId}&entityType=content_item&page=0&size=200`)
    .catch(() => ({ content: [] as BackendEvent[] }))

  const events = page.content ?? []
  const latestByEntity = new Map<string, BackendEvent>()
  for (const e of events) {
    if (!e.entityId) continue
    const existing = latestByEntity.get(e.entityId)
    if (!existing || new Date(e.occurredAt) > new Date(existing.occurredAt)) {
      latestByEntity.set(e.entityId, e)
    }
  }

  let inProgress = 0
  let completed = 0
  const completedIds: string[] = []
  for (const [id, event] of latestByEntity) {
    if (event.eventType === 'CONTENT_COMPLETE') {
      completed++
      completedIds.push(id)
    } else if (event.eventType === 'CONTENT_START') {
      inProgress++
    }
  }
  return { inProgress, completed, completedIds }
}

interface BackendPreferences {
  hoursPerWeek?: number
}

// Real API implementation
const getOverviewAPI = async (): Promise<StatsOverview> => {
  const userId = localStorage.getItem('user_id') || ''
  const to = new Date().toISOString().split('T')[0]
  const from = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]

  const [stats, counts, weeklyActivity, prefs] = await Promise.all([
    httpClient
      .get<BackendStats>(`/tracking/analytics/users/${userId}/stats`)
      .catch(() => ({ totalHours: 0, lessonsCompleted: 0, assessmentsTaken: 0, currentStreak: 0, totalEvents: 0 })),
    fetchContentStatusCounts(userId),
    httpClient
      .get<BackendDailyActivity[]>(`/tracking/analytics/users/${userId}/activity?from=${from}&to=${to}`)
      .catch(() => [] as BackendDailyActivity[]),
    httpClient
      .get<BackendPreferences>('/profiles/me/preferences')
      .catch(() => ({ hoursPerWeek: 10 })),
  ])

  // hoursStudied viene en horas → convertir a minutos
  const weeklyMinutes = (Array.isArray(weeklyActivity) ? weeklyActivity : [])
    .reduce((sum, day) => sum + Math.round((day.hoursStudied || 0) * 60), 0)
  const weeklyGoalMinutes = (prefs?.hoursPerWeek ?? 10) * 60

  return {
    totalStudyTime: Math.round(stats.totalHours * 60),
    streakDays: stats.currentStreak,
    completedCourses: counts.completed,
    inProgressCourses: counts.inProgress,
    weeklyGoal: weeklyGoalMinutes,
    weeklyProgress: weeklyMinutes,
  }
}

const getCompletedContentsListAPI = async (): Promise<CompletedContentItem[]> => {
  const userId = localStorage.getItem('user_id') || ''
  const { completedIds } = await fetchContentStatusCounts(userId)
  if (completedIds.length === 0) return []

  const items = await httpClient
    .get<BackendContentItem[]>('/content/content-items?page=0&size=100')
    .catch(() => [] as BackendContentItem[])

  return (Array.isArray(items) ? items : [])
    .filter(item => completedIds.includes(item.id))
    .map(item => ({ id: item.id, title: item.title }))
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
    minutes: Math.round((a.hoursStudied || 0) * 60),
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
    activities: a.eventCount || 0,
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
  async getCompletedContentsList(): Promise<CompletedContentItem[]> {
    if (USE_REAL_API) return getCompletedContentsListAPI()
    return [
      { id: '1', title: 'React Hooks Fundamentals' },
      { id: '3', title: 'CSS Grid Layout' },
    ]
  },

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
