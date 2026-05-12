//
//  planningMock.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Feb 1, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import type { LearningPlan, CreatePlanRequest } from '@services/planning/planningService'

export const mockLearningPlans: LearningPlan[] = [
  {
    id: '1',
    userId: 'user-1',
    title: 'Java Backend Development Path',
    description: 'Complete path to master Java backend development',
    domainId: '1',
    status: 'active',
    modules: [
      {
        id: '1-1',
        title: 'Java Fundamentals',
        description: 'Learn the basics of Java programming',
        position: 1,
        status: 'pending',
        estimatedHours: 20
      },
      {
        id: '1-2',
        title: 'Spring Framework',
        description: 'Master Spring Boot and Spring ecosystem',
        position: 2,
        status: 'pending',
        estimatedHours: 30
      }
    ],
    createdAt: '2026-01-15T10:00:00Z',
    updatedAt: '2026-01-20T15:30:00Z'
  },
  {
    id: '2',
    userId: 'user-1',
    title: 'React Frontend Mastery',
    description: 'Become a React expert',
    domainId: '2',
    status: 'active',
    modules: [
      {
        id: '2-1',
        title: 'React Foundations',
        description: 'Learn React from scratch',
        position: 1,
        status: 'pending',
        estimatedHours: 25
      }
    ],
    createdAt: '2026-01-18T09:00:00Z',
    updatedAt: '2026-01-22T14:00:00Z'
  }
]

export const mockCreatePlan = (request: CreatePlanRequest): LearningPlan => {
  const newPlan: LearningPlan = {
    id: `plan-${Date.now()}`,
    userId: 'user-1',
    title: `Custom Learning Plan for ${request.domainId}`,
    description: `Personalized plan to achieve ${request.currentLevel ?? 'beginner'} level`,
    domainId: request.domainId,
    status: 'active',
    modules: [
      {
        id: `module-${Date.now()}-1`,
        title: 'Getting Started',
        description: 'Introduction to your learning journey',
        position: 1,
        status: 'pending',
        estimatedHours: 10
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  mockLearningPlans.push(newPlan)
  return newPlan
}
