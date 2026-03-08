//
//  assessmentService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Feb 1, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { httpClient, USE_REAL_API } from '../api/httpClient'
import { mockAssessmentSession, mockNextItem, mockSubmitResponse } from '@mocks/assessment/assessmentMock'

export interface AssessmentSession {
  id: string
  userId: string
  domainId: string
  status: 'in_progress' | 'completed' | 'paused'
  currentQuestionIndex: number
  totalQuestions: number
  score?: number
  startedAt: string
  completedAt?: string
}

export interface AssessmentItem {
  id: string
  question: string
  type: 'multiple_choice' | 'true_false' | 'text'
  options?: string[]
  correctAnswer?: string
  explanation?: string
  difficulty: number
  domain: string
}

export interface UserResponse {
  itemId: string
  selectedAnswer: string
  isCorrect?: boolean
  feedback?: string
  responseTime: number
}

export interface SubmitResponseRequest {
  answer: string
  responseTime: number
}

export interface AssessmentSessionWithFeedback {
  session: AssessmentSession
  item: AssessmentItem
  response?: UserResponse
}

// Backend API functions
const createSessionAPI = async (domainId: string): Promise<AssessmentSession> => {
  return httpClient.post<AssessmentSession>('/assessment/assessments/session', { domainId })
}

const getNextItemAPI = async (sessionId: string): Promise<AssessmentItem> => {
  return httpClient.get<AssessmentItem>(`/assessment/assessments/session/${sessionId}/next-item`)
}

const submitResponseAPI = async (sessionId: string, request: SubmitResponseRequest): Promise<AssessmentSessionWithFeedback> => {
  return httpClient.post<AssessmentSessionWithFeedback>(`/assessment/assessments/session/${sessionId}/response`, request)
}

const getSessionAPI = async (sessionId: string): Promise<AssessmentSession> => {
  return httpClient.get<AssessmentSession>(`/assessment/assessments/session/${sessionId}`)
}

// Mock functions
const createSessionMock = async (domainId: string): Promise<AssessmentSession> => {
  await new Promise(r => setTimeout(r, 500))
  return mockAssessmentSession(domainId)
}

const getNextItemMock = async (sessionId: string): Promise<AssessmentItem> => {
  await new Promise(r => setTimeout(r, 300))
  return mockNextItem(sessionId)
}

const submitResponseMock = async (sessionId: string, request: SubmitResponseRequest): Promise<AssessmentSessionWithFeedback> => {
  await new Promise(r => setTimeout(r, 400))
  return mockSubmitResponse(sessionId, request)
}

const getSessionMock = async (sessionId: string): Promise<AssessmentSession> => {
  await new Promise(r => setTimeout(r, 200))
  // Mock implementation - would need to track sessions in memory
  return {
    id: sessionId,
    userId: 'user-1',
    domainId: '1',
    status: 'in_progress',
    currentQuestionIndex: 1,
    totalQuestions: 10,
    startedAt: new Date().toISOString()
  }
}

// Export adapter functions
export const createSession = USE_REAL_API ? createSessionAPI : createSessionMock
export const getNextItem = USE_REAL_API ? getNextItemAPI : getNextItemMock
export const submitResponse = USE_REAL_API ? submitResponseAPI : submitResponseMock
export const getSession = USE_REAL_API ? getSessionAPI : getSessionMock
