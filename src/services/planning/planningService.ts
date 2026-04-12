//
//  planningService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Feb 1, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { httpClient, USE_REAL_API } from '../api/httpClient'
import { mockLearningPlans, mockCreatePlan } from '@mocks/planning/planningMock'

// ---------------------------------------------------------------------------
// Interfaces — alineadas con los modelos reales del backend (planning-service)
// ---------------------------------------------------------------------------

export interface PlanActivity {
  id: string
  position: number
  activityType: string          // 'lesson' | 'exercise' | 'quiz'
  status: string                // 'pending' | 'in_progress' | 'completed'
  contentRef: string            // ref al contenido ('lesson:x' | UUID)
  estimatedMinutes?: number
  startedAt?: string
  completedAt?: string
  actualMinutesSpent?: number
}

export interface PlanModule {
  id: string
  planId?: string
  position: number              // ⚠️ es 'position', NO 'order'
  title: string                 // ⚠️ es 'title', NO 'name'
  description?: string
  status: string                // 'pending' | 'in_progress' | 'completed'
  estimatedHours?: number
  targetSkills?: string[]
  activities?: PlanActivity[]
}

export interface LearningPlan {
  id: string
  userId: string                // String (no UUID tipado) en el backend
  goalId?: string               // String (no UUID tipado) en el backend
  status: string                // 'active' | 'completed' | 'paused'
  startDate?: string
  endDate?: string
  hoursPerWeek?: number
  generatedBy?: string          // 'ai'
  rawPlanAi?: string
  createdAt?: string
  updatedAt?: string
  modules?: PlanModule[]
  // Campos legacy del mock (compatibilidad con USE_REAL_API=false):
  title?: string
  description?: string
  domainId?: string
}

export interface CreatePlanRequest {
  userId: string                // de localStorage['user_id']
  goalId: string                // UUID del objetivo existente del usuario
  domainId?: string             // UUID del dominio — el backend lo usa para contexto de la IA
  planName?: string             // nombre del plan (usado por IA como título del objetivo)
  modules: []                   // vacío → el backend invoca AI automáticamente
}

export interface UpdateActivityRequest {
  status: string                // 'completed' | 'in_progress' | 'pending'
  overrideEstimatedMinutes?: number
}

// Respuesta paginada de Spring (GET /planning/plans)
interface SpringPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

// ---------------------------------------------------------------------------
// API real
// ---------------------------------------------------------------------------

const getActivePlanAPI = async (): Promise<LearningPlan | null> => {
  const userId = localStorage.getItem('user_id') ?? ''
  const page = await httpClient.get<SpringPage<LearningPlan>>(
    `/planning/plans?userId=${userId}&status=active&page=0&size=1`
  )
  return page.content?.[0] ?? null
}

const createPlanAPI = async (request: CreatePlanRequest): Promise<LearningPlan> => {
  return httpClient.post<LearningPlan>('/planning/plans', request)
}

const getPlanAPI = async (planId: string): Promise<LearningPlan> => {
  return httpClient.get<LearningPlan>(`/planning/plans/${planId}`)
}

const getPlanModulesAPI = async (planId: string): Promise<PlanModule[]> => {
  return httpClient.get<PlanModule[]>(`/planning/plans/${planId}/modules`)
}

const getPlanActivitiesAPI = async (planId: string, moduleId?: string): Promise<PlanActivity[]> => {
  const query = moduleId ? `?moduleId=${moduleId}` : ''
  return httpClient.get<PlanActivity[]>(`/planning/plans/${planId}/activities${query}`)
}

const updateActivityAPI = async (
  planId: string,
  activityId: string,
  request: UpdateActivityRequest
): Promise<PlanActivity> => {
  return httpClient.patch<PlanActivity>(
    `/planning/plans/${planId}/activities/${activityId}`,
    request
  )
}

const replanAPI = async (planId: string): Promise<void> => {
  await httpClient.post(`/planning/plans/${planId}/replan?reason=USER_REQUEST`)
}

// ---------------------------------------------------------------------------
// Mock — sin cambios (funciona con USE_REAL_API=false)
// ---------------------------------------------------------------------------

const getActivePlanMock = async (): Promise<LearningPlan | null> => {
  await new Promise(r => setTimeout(r, 500))
  return mockLearningPlans[0] ?? null
}

const createPlanMock = async (request: CreatePlanRequest): Promise<LearningPlan> => {
  await new Promise(r => setTimeout(r, 1000))
  // El mock espera el formato antiguo; lo adaptamos
  return mockCreatePlan({ domainId: request.goalId } as never) as unknown as LearningPlan
}

const getPlanMock = async (planId: string): Promise<LearningPlan> => {
  await new Promise(r => setTimeout(r, 300))
  const plan = mockLearningPlans.find(p => p.id === planId)
  if (!plan) throw new Error('Plan not found')
  return plan as unknown as LearningPlan
}

const getPlanModulesMock = async (): Promise<PlanModule[]> => {
  await new Promise(r => setTimeout(r, 300))
  const plan = mockLearningPlans[0] as unknown as { modules?: { id: string; title: string; order: number }[] }
  return (plan?.modules ?? []).map((m, i) => ({
    id: m.id,
    position: m.order ?? i + 1,
    title: m.title,
    status: 'pending',
  }))
}

const getPlanActivitiesMock = async (): Promise<PlanActivity[]> => []

const updateActivityMock = async (
  planId: string,
  activityId: string,
  request: UpdateActivityRequest
): Promise<PlanActivity> => ({
  id: activityId,
  position: 1,
  activityType: 'lesson',
  status: request.status,
  contentRef: planId,  // usa planId para evitar el error de lint
})

const replanMock = async (): Promise<void> => {
  await new Promise(r => setTimeout(r, 500))
}

// ---------------------------------------------------------------------------
// Exports — patrón dual-mode (USE_REAL_API)
// ---------------------------------------------------------------------------

export const getActivePlan    = USE_REAL_API ? getActivePlanAPI    : getActivePlanMock
export const createPlan       = USE_REAL_API ? createPlanAPI       : createPlanMock
export const getPlan          = USE_REAL_API ? getPlanAPI          : getPlanMock
export const getPlanModules   = USE_REAL_API ? getPlanModulesAPI   : getPlanModulesMock
export const getPlanActivities = USE_REAL_API ? getPlanActivitiesAPI : getPlanActivitiesMock
export const updateActivity   = USE_REAL_API ? updateActivityAPI   : updateActivityMock
export const replan           = USE_REAL_API ? replanAPI           : replanMock

// Compatibilidad — getPlans devuelve el plan activo como array (evita romper imports existentes)
export const getPlans = USE_REAL_API
  ? async (): Promise<LearningPlan[]> => {
      const plan = await getActivePlanAPI()
      return plan ? [plan] : []
    }
  : async (): Promise<LearningPlan[]> => mockLearningPlans as unknown as LearningPlan[]
