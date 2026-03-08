//
//  planningService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Feb 1, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { httpClient, USE_REAL_API } from '../api/httpClient'
import { mockLearningPlans, mockCreatePlan } from '@mocks/planning/planningMock'

export interface LearningPlan {
  id: string
  userId: string
  title: string
  description: string
  domainId: string
  status: 'active' | 'completed' | 'paused'
  modules: LearningModule[]
  createdAt: string
  updatedAt: string
}

export interface LearningModule {
  id: string
  title: string
  description: string
  order: number
  resources: LearningResource[]
  estimatedHours: number
}

export interface LearningResource {
  id: string
  type: 'article' | 'video' | 'exercise' | 'quiz'
  title: string
  description: string
  url?: string
  completed: boolean
}

export interface CreatePlanRequest {
  domainId: string
  goals: string[]
  currentLevel: string
  targetLevel: string
  intensity: 'low' | 'medium' | 'high'
  timeframe: number // weeks
}

// Backend API functions
const getPlansAPI = async (): Promise<LearningPlan[]> => {
  return httpClient.get<LearningPlan[]>('/planning/plans')
}

const createPlanAPI = async (request: CreatePlanRequest): Promise<LearningPlan> => {
  return httpClient.post<LearningPlan>('/planning/plans', request)
}

const getPlanAPI = async (planId: string): Promise<LearningPlan> => {
  return httpClient.get<LearningPlan>(`/planning/plans/${planId}`)
}

// Mock functions
const getPlansMock = async (): Promise<LearningPlan[]> => {
  await new Promise(r => setTimeout(r, 500))
  return mockLearningPlans
}

const createPlanMock = async (request: CreatePlanRequest): Promise<LearningPlan> => {
  await new Promise(r => setTimeout(r, 1000))
  return mockCreatePlan(request)
}

const getPlanMock = async (planId: string): Promise<LearningPlan> => {
  await new Promise(r => setTimeout(r, 300))
  const plan = mockLearningPlans.find(p => p.id === planId)
  if (!plan) throw new Error('Plan not found')
  return plan
}

// Export adapter functions
export const getPlans = USE_REAL_API ? getPlansAPI : getPlansMock
export const createPlan = USE_REAL_API ? createPlanAPI : createPlanMock
export const getPlan = USE_REAL_API ? getPlanAPI : getPlanMock
