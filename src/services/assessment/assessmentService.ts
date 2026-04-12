//
//  assessmentService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Feb 1, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { httpClient, USE_REAL_API } from '../api/httpClient'
import { mockAssessmentSession, mockNextItem, mockSubmitResponse } from '@mocks/assessment/assessmentMock'

// ---------------------------------------------------------------------------
// Interfaces — alineadas con los modelos reales del backend (assessment-service)
// Los campos opcionales mantienen compatibilidad con los mocks (USE_REAL_API=false)
// ---------------------------------------------------------------------------

export interface AssessmentSession {
  id: string
  userId: string
  type?: string                 // 'ADAPTIVE' en API real
  status: 'in_progress' | 'completed' | 'paused'
  planId?: string               // requerido en API real
  domainId?: string
  startedAt: string
  completedAt?: string
  presentedItemIds?: string[]   // deduplicación de ítems (US-0115)
  // Campos legacy del mock (no presentes en el backend real):
  currentQuestionIndex?: number
  totalQuestions?: number
  score?: number
}

export interface AssessmentItemOption {
  id: string
  label: string
  statement: string             // texto de la opción
  isCorrect?: boolean
  feedbackTemplate?: string
}

export interface AssessmentItem {
  id: string
  stem?: string                 // ⚠️ campo real del backend (enunciado de la pregunta)
  question?: string             // campo legacy del mock
  type: 'multiple_choice' | 'true_false' | 'text' | 'open'
  options?: AssessmentItemOption[] | string[]  // objetos en API real, strings en mock
  difficulty: number            // 0.0 - 1.0
  domainId?: string
  domain?: string               // campo legacy del mock
  correctAnswer?: string        // campo legacy del mock
  explanation?: string          // campo legacy del mock
}

export interface SubmitResponseRequest {
  assessmentItemId: string      // ⚠️ UUID del ítem (no 'itemId', no 'answer')
  selectedOptionId: string      // ⚠️ UUID de la opción seleccionada
  responsePayload: string       // JSON.stringify({}) para selección múltiple
  responseTimeMs: number        // milisegundos
}

export interface UserItemResponseWithFeedback {
  id: string
  sessionId: string
  assessmentItemId: string
  selectedOptionId?: string
  isCorrect: boolean
  responseTimeMs?: number
  feedback: string              // texto generado por IA
  masteryUpdates?: {
    skillId: string
    mastery: number             // 0.0 - 1.0
    attempts: number
  }[]
}

// Tipo de retorno del mock (mantiene compatibilidad hacia atrás)
export interface AssessmentSessionWithFeedback {
  session: AssessmentSession
  item: AssessmentItem
  response?: {
    itemId: string
    selectedAnswer: string
    isCorrect?: boolean
    feedback?: string
    responseTime: number
  }
}

// ---------------------------------------------------------------------------
// API real — rutas corregidas (PLURAL: sessions, responses)
// ---------------------------------------------------------------------------

const createSessionAPI = async (planId: string): Promise<AssessmentSession> => {
  const userId = localStorage.getItem('user_id') ?? ''
  return httpClient.post<AssessmentSession>('/assessment/assessments/sessions', {
    userId,
    planId,
    type: 'ADAPTIVE',
  })
}

const getNextItemAPI = async (sessionId: string): Promise<AssessmentItem> => {
  return httpClient.get<AssessmentItem>(
    `/assessment/assessments/sessions/${sessionId}/next-item`
  )
}

const submitResponseAPI = async (
  sessionId: string,
  request: SubmitResponseRequest
): Promise<UserItemResponseWithFeedback> => {
  return httpClient.post<UserItemResponseWithFeedback>(
    `/assessment/assessments/sessions/${sessionId}/responses`,
    request
  )
}

const getSessionAPI = async (sessionId: string): Promise<AssessmentSession> => {
  return httpClient.get<AssessmentSession>(
    `/assessment/assessments/sessions/${sessionId}`
  )
}

const closeSessionAPI = async (sessionId: string): Promise<void> => {
  await httpClient.put(
    `/assessment/assessments/sessions/${sessionId}/status?status=COMPLETED`
  )
}

const getMasteryAPI = async (userId: string) => {
  return httpClient.get<{
    skillId: string
    skillName: string
    domainName: string
    mastery: number
    attempts: number
    lastUpdate: string
  }[]>(`/assessment/users/${userId}/skill-mastery`)
}

// ---------------------------------------------------------------------------
// Mock — sin cambios (funciona con USE_REAL_API=false)
// ---------------------------------------------------------------------------

const createSessionMock = async (planId: string): Promise<AssessmentSession> => {
  await new Promise(r => setTimeout(r, 500))
  // El mock usa domainId internamente; le pasamos planId como identificador
  return mockAssessmentSession(planId) as unknown as AssessmentSession
}

const getNextItemMock = async (sessionId: string): Promise<AssessmentItem> => {
  await new Promise(r => setTimeout(r, 300))
  return mockNextItem(sessionId) as unknown as AssessmentItem
}

const submitResponseMock = async (
  sessionId: string,
  request: SubmitResponseRequest
): Promise<UserItemResponseWithFeedback> => {
  await new Promise(r => setTimeout(r, 400))
  const legacyRequest = { answer: request.selectedOptionId, responseTime: request.responseTimeMs }
  const result = mockSubmitResponse(sessionId, legacyRequest) as AssessmentSessionWithFeedback
  return {
    id: crypto.randomUUID(),
    sessionId,
    assessmentItemId: request.assessmentItemId,
    isCorrect: result.response?.isCorrect ?? false,
    feedback: result.response?.feedback ?? '',
  }
}

const getSessionMock = async (sessionId: string): Promise<AssessmentSession> => {
  await new Promise(r => setTimeout(r, 200))
  return {
    id: sessionId,
    userId: 'mock-user',
    domainId: '1',
    status: 'in_progress',
    currentQuestionIndex: 1,
    totalQuestions: 10,
    startedAt: new Date().toISOString(),
  }
}

const closeSessionMock = async (): Promise<void> => {
  await new Promise(r => setTimeout(r, 200))
}

const getMasteryMock = async () => []

// ---------------------------------------------------------------------------
// Exports — patrón dual-mode (USE_REAL_API)
// ---------------------------------------------------------------------------

export const createSession    = USE_REAL_API ? createSessionAPI    : createSessionMock
export const getNextItem      = USE_REAL_API ? getNextItemAPI      : getNextItemMock
export const submitResponse   = USE_REAL_API ? submitResponseAPI   : submitResponseMock
export const getSession       = USE_REAL_API ? getSessionAPI       : getSessionMock
export const closeSession     = USE_REAL_API ? closeSessionAPI     : closeSessionMock
export const getMastery       = USE_REAL_API ? getMasteryAPI       : getMasteryMock
