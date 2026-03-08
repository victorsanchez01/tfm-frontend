//
//  dashboardService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { httpClient, USE_REAL_API } from '../api/httpClient'

export interface ActivityItem {
  id: string
  type: 'completed' | 'created' | 'evaluated'
  title: string
  detail: string
  time: string
}

export interface DashboardStats {
  completedLessons: number
  totalLessons: number
  activeGoals: number
  completedGoals: number
  totalCourses: number
}

// Backend DTOs
interface BackendStats {
  totalHours: number
  completedActivities: number
  currentStreak: number
}

interface BackendGoal {
  goalId: string
  status: string
}

interface BackendPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
}

interface BackendEvent {
  eventId: string
  contentItemId: string
  eventType: string
  timestamp: string
}

const formatRelativeTime = (timestamp: string): string => {
  const now = new Date()
  const then = new Date(timestamp)
  const diffMs = now.getTime() - then.getTime()
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)

  if (diffH < 1) return 'hace menos de 1h'
  if (diffH < 24) return `hace ${diffH}h`
  if (diffD === 1) return 'ayer'
  if (diffD < 7) return `hace ${diffD} días`
  return `hace ${Math.floor(diffD / 7)} semana(s)`
}

const mapEventType = (eventType: string): ActivityItem['type'] => {
  if (eventType === 'CONTENT_COMPLETED') return 'completed'
  if (eventType === 'GOAL_CREATED') return 'created'
  if (eventType === 'QUIZ_COMPLETED') return 'evaluated'
  return 'completed'
}

// Real API implementation
const getDashboardStatsAPI = async (): Promise<DashboardStats> => {
  const userId = localStorage.getItem('user_id') || ''

  const [stats, goals, contents] = await Promise.all([
    httpClient
      .get<BackendStats>(`/tracking/analytics/users/${userId}/stats`)
      .catch(() => ({ totalHours: 0, completedActivities: 0, currentStreak: 0 })),
    httpClient
      .get<BackendGoal[]>('/profiles/me/goals')
      .catch(() => [] as BackendGoal[]),
    httpClient
      .get<unknown[]>('/content/content-items?page=0&size=100')
      .catch(() => [] as unknown[]),
  ])

  const goalsList = Array.isArray(goals) ? goals : []
  const activeGoals = goalsList.filter(g => g.status?.toUpperCase() === 'ACTIVE').length
  const completedGoals = goalsList.filter(g => g.status?.toUpperCase() === 'COMPLETED').length
  const totalCourses = Array.isArray(contents) ? contents.length : 0

  return {
    completedLessons: stats.completedActivities,
    totalLessons: totalCourses,
    activeGoals,
    completedGoals,
    totalCourses,
  }
}

const getRecentActivitiesAPI = async (): Promise<ActivityItem[]> => {
  const userId = localStorage.getItem('user_id') || ''
  const page = await httpClient
    .get<BackendPage<BackendEvent>>(`/tracking/events?userId=${userId}&page=0&size=10`)
    .catch(() => ({ content: [], totalElements: 0, totalPages: 0 }))

  return page.content.map(event => ({
    id: event.eventId,
    type: mapEventType(event.eventType),
    title: `${event.eventType.replace(/_/g, ' ')}`,
    detail: `Contenido: ${event.contentItemId?.substring(0, 8) || 'N/A'}`,
    time: formatRelativeTime(event.timestamp),
  }))
}

// Mock implementation
export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    if (USE_REAL_API) return getDashboardStatsAPI()
    await new Promise(resolve => setTimeout(resolve, 500))
    return {
      completedLessons: 12,
      totalLessons: 45,
      activeGoals: 3,
      completedGoals: 8,
      totalCourses: 15,
    }
  },

  async getRecentActivities(): Promise<ActivityItem[]> {
    if (USE_REAL_API) return getRecentActivitiesAPI()
    await new Promise(resolve => setTimeout(resolve, 300))
    return [
      {
        id: '1',
        type: 'completed',
        title: 'Completaste: Introducción a React',
        detail: 'Lección 3 de 10',
        time: 'hace 2h',
      },
      {
        id: '2',
        type: 'created',
        title: 'Nuevo objetivo: Aprender TypeScript',
        detail: 'Plazo: 30 días',
        time: 'ayer',
      },
      {
        id: '3',
        type: 'evaluated',
        title: 'Evaluación: Fundamentos de JavaScript',
        detail: 'Puntuación: 85/100',
        time: 'hace 3 días',
      },
    ]
  },
}
