//
//  assessmentMock.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Feb 1, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import type { AssessmentSession, AssessmentItem, AssessmentSessionWithFeedback } from '@services/assessment/assessmentService'

interface MockSubmitRequest {
  answer: string
  responseTime: number
}

const mockQuestions: Record<string, AssessmentItem[]> = {
  '1': [ // Java questions
    {
      id: 'q1',
      question: 'What is the correct syntax to print "Hello, World!" in Java?',
      type: 'multiple_choice',
      options: [
        'System.out.println("Hello, World!");',
        'console.log("Hello, World!");',
        'print("Hello, World!");',
        'System.print("Hello, World!");'
      ],
      correctAnswer: 'System.out.println("Hello, World!");',
      explanation: 'System.out.println() is the correct method to print output in Java.',
      difficulty: 1,
      domain: 'Java'
    },
    {
      id: 'q2',
      question: 'Which of the following is not a Java keyword?',
      type: 'multiple_choice',
      options: ['static', 'void', 'main', 'Integer'],
      correctAnswer: 'Integer',
      explanation: 'Integer is a wrapper class, not a keyword. int is the keyword.',
      difficulty: 2,
      domain: 'Java'
    }
  ],
  '2': [ // React questions
    {
      id: 'q3',
      question: 'What hook is used to manage state in functional components?',
      type: 'multiple_choice',
      options: ['useEffect', 'useState', 'useContext', 'useReducer'],
      correctAnswer: 'useState',
      explanation: 'useState is the primary hook for managing state in functional components.',
      difficulty: 1,
      domain: 'React'
    }
  ]
}

const activeSessions: Map<string, AssessmentSession> = new Map()

export const mockAssessmentSession = (domainId: string): AssessmentSession => {
  const session: AssessmentSession = {
    id: `session-${Date.now()}`,
    userId: 'user-1',
    domainId,
    status: 'in_progress',
    currentQuestionIndex: 0,
    totalQuestions: mockQuestions[domainId]?.length || 5,
    startedAt: new Date().toISOString()
  }
  
  activeSessions.set(session.id, session)
  return session
}

export const mockNextItem = (sessionId: string): AssessmentItem => {
  const session = activeSessions.get(sessionId)
  if (!session) throw new Error('Session not found')

  const questions = mockQuestions[session.domainId ?? ''] || []
  const question = questions[session.currentQuestionIndex ?? 0]
  
  if (!question) throw new Error('No more questions')
  
  return question
}

export const mockSubmitResponse = (sessionId: string, request: MockSubmitRequest): AssessmentSessionWithFeedback => {
  const session = activeSessions.get(sessionId)
  if (!session) throw new Error('Session not found')

  const question = mockNextItem(sessionId)
  const isCorrect = question.correctAnswer === request.answer

  session.currentQuestionIndex = (session.currentQuestionIndex ?? 0) + 1
  if (session.currentQuestionIndex >= (session.totalQuestions ?? 0)) {
    session.status = 'completed'
    session.completedAt = new Date().toISOString()
  }

  return {
    session,
    item: question,
    response: {
      itemId: question.id,
      selectedAnswer: request.answer,
      isCorrect,
      feedback: isCorrect ? 'Correct!' : `Incorrect. ${question.explanation || 'Review the material and try again.'}`,
      responseTime: request.responseTime
    }
  }
}
