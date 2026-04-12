//
//  goalsService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { httpClient, USE_REAL_API } from '../api/httpClient'

export interface Goal {
  id: string
  title: string
  description: string
  targetDate: string
  status: 'active' | 'completed' | 'paused'
  progress: number
  category: 'career' | 'skill' | 'project' | 'certification'
  domainId?: string       // UUID del dominio (expuesto desde el backend)
  targetLevel?: string    // nivel objetivo
  createdAt: string
  updatedAt: string
  milestones: Milestone[]
}

export interface Milestone {
  id: string
  title: string
  completed: boolean
  completedAt?: string
}

export interface CreateGoalData {
  title: string
  description: string
  targetDate: string
  category: 'career' | 'skill' | 'project' | 'certification'
}

export interface UpdateGoalData {
  title?: string
  description?: string
  targetDate?: string
  status?: 'active' | 'completed' | 'paused'
  progress?: number
}

// Backend DTOs
interface BackendGoal {
  goalId?: string
  id?: string
  title: string
  description: string
  domainId?: string
  targetLevel?: string
  dueDate?: string
  intensity?: string
  progress?: number
  status?: string
  createdAt?: string
  updatedAt?: string
}

interface BackendCreateGoal {
  title: string
  description?: string
  dueDate?: string
  intensity?: string
}

interface BackendUpdateGoal {
  title?: string
  description?: string
  dueDate?: string
  intensity?: string
}

const categoryToIntensity = (category: string): string => {
  const map: Record<string, string> = {
    career: 'HIGH',
    certification: 'HIGH',
    skill: 'MEDIUM',
    project: 'LOW',
  }
  return map[category] || 'MEDIUM'
}

const intensityToCategory = (intensity?: string): Goal['category'] => {
  const map: Record<string, Goal['category']> = {
    HIGH: 'certification',
    MEDIUM: 'skill',
    LOW: 'project',
  }
  return map[intensity?.toUpperCase() || ''] || 'skill'
}

const mapStatus = (status?: string): Goal['status'] => {
  const map: Record<string, Goal['status']> = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    PAUSED: 'paused',
  }
  return map[status?.toUpperCase() || ''] || 'active'
}

const adaptGoal = (backend: BackendGoal): Goal => ({
  id: backend.goalId || backend.id || '',
  title: backend.title,
  description: backend.description || '',
  targetDate: backend.dueDate || '',
  status: mapStatus(backend.status),
  progress: backend.progress || 0,
  category: intensityToCategory(backend.intensity),
  domainId: backend.domainId,       // exponer domainId para uso en plan generation
  targetLevel: backend.targetLevel,
  createdAt: backend.createdAt || new Date().toISOString(),
  updatedAt: backend.updatedAt || new Date().toISOString(),
  milestones: [],
})

// Real API implementation
const getGoalsAPI = async (): Promise<Goal[]> => {
  const response = await httpClient.get<BackendGoal[]>('/profiles/me/goals')
  return (Array.isArray(response) ? response : []).map(adaptGoal)
}

const getGoalAPI = async (id: string): Promise<Goal | null> => {
  const goals = await getGoalsAPI()
  return goals.find(g => g.id === id) || null
}

const createGoalAPI = async (data: CreateGoalData): Promise<Goal> => {
  const body: BackendCreateGoal = {
    title: data.title,
    description: data.description,
    dueDate: data.targetDate || undefined,
    intensity: categoryToIntensity(data.category),
  }
  const response = await httpClient.post<BackendGoal>('/profiles/me/goals', body)
  return adaptGoal(response)
}

const updateGoalAPI = async (id: string, data: UpdateGoalData): Promise<Goal> => {
  const body: BackendUpdateGoal = {
    title: data.title,
    description: data.description,
    dueDate: data.targetDate,
  }
  const response = await httpClient.put<BackendGoal>(`/profiles/me/goals/${id}`, body)
  return adaptGoal(response)
}

const deleteGoalAPI = async (id: string): Promise<void> => {
  await httpClient.delete<void>(`/profiles/me/goals/${id}`)
}

const updateProgressAPI = async (id: string, progress: number): Promise<Goal> => {
  await httpClient.patch<void>(`/profiles/me/goals/${id}/progress`, { percentage: progress })
  const goal = await getGoalAPI(id)
  if (!goal) throw new Error('Goal not found')
  return goal
}

// Mock data
const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Aprender React Advanced',
    description: 'Dominar patrones avanzados de React incluyendo hooks personalizados, render props y optimización',
    targetDate: '2024-03-15',
    status: 'active',
    progress: 65,
    category: 'skill',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
    milestones: [
      { id: '1-1', title: 'Completar curso de React Patterns', completed: true },
      { id: '1-2', title: 'Construir proyecto con Redux Toolkit', completed: true },
      { id: '1-3', title: 'Implementar testing con Jest', completed: false },
    ],
  },
  {
    id: '2',
    title: 'Certificación AWS Cloud Practitioner',
    description: 'Obtener la certificación fundamental de AWS',
    targetDate: '2024-02-28',
    status: 'active',
    progress: 40,
    category: 'certification',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-20',
    milestones: [],
  },
]

export const goalsService = {
  async getGoals(): Promise<Goal[]> {
    if (USE_REAL_API) return getGoalsAPI()
    await new Promise(resolve => setTimeout(resolve, 500))
    return [...mockGoals]
  },

  async getGoal(id: string): Promise<Goal | null> {
    if (USE_REAL_API) return getGoalAPI(id)
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockGoals.find(g => g.id === id) || null
  },

  async createGoal(data: CreateGoalData): Promise<Goal> {
    if (USE_REAL_API) return createGoalAPI(data)
    await new Promise(resolve => setTimeout(resolve, 800))
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      targetDate: data.targetDate,
      status: 'active',
      progress: 0,
      category: data.category,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      milestones: [],
    }
    mockGoals.push(newGoal)
    return newGoal
  },

  async updateGoal(id: string, data: UpdateGoalData): Promise<Goal> {
    if (USE_REAL_API) return updateGoalAPI(id, data)
    await new Promise(resolve => setTimeout(resolve, 600))
    const idx = mockGoals.findIndex(g => g.id === id)
    if (idx === -1) throw new Error('Goal not found')
    mockGoals[idx] = { ...mockGoals[idx], ...data, updatedAt: new Date().toISOString().split('T')[0] }
    return { ...mockGoals[idx] }
  },

  async deleteGoal(id: string): Promise<void> {
    if (USE_REAL_API) return deleteGoalAPI(id)
    await new Promise(resolve => setTimeout(resolve, 400))
    const index = mockGoals.findIndex(g => g.id === id)
    if (index === -1) throw new Error('Goal not found')
    mockGoals.splice(index, 1)
  },

  async updateProgress(id: string, progress: number): Promise<Goal> {
    if (USE_REAL_API) return updateProgressAPI(id, progress)
    await new Promise(resolve => setTimeout(resolve, 300))
    const goal = mockGoals.find(g => g.id === id)
    if (!goal) throw new Error('Goal not found')
    goal.progress = progress
    return { ...goal }
  },

  async updateMilestone(goalId: string, milestoneId: string, completed: boolean): Promise<Goal> {
    await new Promise(resolve => setTimeout(resolve, 300))
    const goal = mockGoals.find(g => g.id === goalId)
    if (!goal) throw new Error('Goal not found')
    const milestone = goal.milestones.find(m => m.id === milestoneId)
    if (!milestone) throw new Error('Milestone not found')
    milestone.completed = completed
    milestone.completedAt = completed ? new Date().toISOString().split('T')[0] : undefined
    const completedCount = goal.milestones.filter(m => m.completed).length
    goal.progress =
      goal.milestones.length > 0 ? Math.round((completedCount / goal.milestones.length) * 100) : 0
    return { ...goal }
  },
}
