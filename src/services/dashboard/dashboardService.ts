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
  icon?: string   // emoji específico por tipo de evento
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

// Campos reales del modelo LearningEvent (tracking-service)
interface BackendEvent {
  id: string          // UUID — era 'eventId'
  eventType: string
  entityType: string
  entityId: string    // UUID — era 'contentItemId'
  occurredAt: string  // ISO-8601 — era 'timestamp'
  payload?: string
}

const formatRelativeTime = (occurredAt: string): string => {
  if (!occurredAt) return ''
  const now = new Date()
  const then = new Date(occurredAt)
  if (isNaN(then.getTime())) return ''
  const diffMs = now.getTime() - then.getTime()
  const diffH = Math.floor(diffMs / 3600000)
  const diffD = Math.floor(diffMs / 86400000)

  if (diffH < 1) return 'hace menos de 1h'
  if (diffH < 24) return `hace ${diffH}h`
  if (diffD === 1) return 'ayer'
  if (diffD < 7) return `hace ${diffD} día${diffD > 1 ? 's' : ''}`
  return `hace ${Math.floor(diffD / 7)} semana${Math.floor(diffD / 7) > 1 ? 's' : ''}`
}

const EVENT_LABELS: Record<string, { title: string; type: ActivityItem['type']; icon: string }> = {
  CONTENT_START:      { title: 'Inició un contenido',          type: 'created',   icon: '📖' },
  CONTENT_COMPLETE:   { title: 'Completó un contenido',        type: 'completed', icon: '✅' },
  CONTENT_RESET:      { title: 'Reinició un contenido',        type: 'created',   icon: '📖' },
  CONTENT_BOOKMARK:   { title: 'Guardó en favoritos',          type: 'created',   icon: '🔖' },
  CONTENT_UNBOOKMARK: { title: 'Quitó de favoritos',           type: 'created',   icon: '🔖' },
  GOAL_CREATED:       { title: 'Nuevo objetivo creado',         type: 'created',   icon: '🎯' },
  PLAN_GENERATED:     { title: 'Plan de aprendizaje generado', type: 'completed', icon: '💡' },
  ACTIVITY_COMPLETE:  { title: 'Actividad completada',         type: 'completed', icon: '✅' },
  EVALUATION_START:   { title: 'Inició una evaluación',        type: 'evaluated', icon: '🎯' },
  EVALUATION_END:     { title: 'Completó una evaluación',      type: 'evaluated', icon: '🎯' },
}

const ENTITY_LABELS: Record<string, string> = {
  content_item: 'Contenido',
  plan:         'Plan',
  activity:     'Actividad',
  assessment:   'Evaluación',
  skill:        'Skill',
}

const mapEventType = (eventType: string): ActivityItem['type'] =>
  EVENT_LABELS[eventType]?.type ?? 'completed'

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

  // Fetch events y catálogo de contenidos en paralelo para resolver nombres
  const [page, contentItems] = await Promise.all([
    httpClient
      .get<BackendPage<BackendEvent>>(`/tracking/events?userId=${userId}&page=0&size=10`)
      .catch(() => ({ content: [], totalElements: 0, totalPages: 0 })),
    httpClient
      .get<{ id: string; title: string }[]>('/content/content-items?page=0&size=100')
      .catch(() => [] as { id: string; title: string }[]),
  ])

  // Mapa rápido: contentId → title
  const contentMap = new Map<string, string>()
  for (const item of Array.isArray(contentItems) ? contentItems : []) {
    contentMap.set(item.id, item.title)
  }

  return (page.content ?? []).map(event => {
    const label = EVENT_LABELS[event.eventType]

    // 1. Intentar extraer el título desde el payload JSON
    let payloadTitle = ''
    if (event.payload) {
      try {
        const parsed = JSON.parse(event.payload) as Record<string, unknown>
        if (typeof parsed.title === 'string' && parsed.title.trim()) {
          payloadTitle = parsed.title.trim()
        }
      } catch { /* payload no es JSON válido */ }
    }

    // 2. Si no hay título en el payload, resolver por entityType/entityId
    let detail = payloadTitle
    if (!detail) {
      if (event.entityId && event.entityType === 'content_item') {
        detail = contentMap.get(event.entityId) ?? ''
      } else if (event.entityType) {
        detail = ENTITY_LABELS[event.entityType] ?? ''
      }
    }

    return {
      id: event.id,
      type: mapEventType(event.eventType),
      title: label?.title ?? event.eventType.replace(/_/g, ' '),
      detail,
      time: formatRelativeTime(event.occurredAt),
      icon: label?.icon,
    }
  })
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
