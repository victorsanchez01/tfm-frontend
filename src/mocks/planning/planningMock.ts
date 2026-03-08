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
        order: 1,
        resources: [
          {
            id: 'r1',
            type: 'article',
            title: 'Introduction to Java',
            description: 'Basic concepts of Java',
            completed: true
          },
          {
            id: 'r2',
            type: 'video',
            title: 'Java OOP Concepts',
            description: 'Object-oriented programming',
            completed: false
          }
        ],
        estimatedHours: 20
      },
      {
        id: '1-2',
        title: 'Spring Framework',
        description: 'Master Spring Boot and Spring ecosystem',
        order: 2,
        resources: [
          {
            id: 'r3',
            type: 'article',
            title: 'Spring Boot Basics',
            description: 'Getting started with Spring Boot',
            completed: false
          }
        ],
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
        order: 1,
        resources: [
          {
            id: 'r4',
            type: 'video',
            title: 'React Components',
            description: 'Understanding components',
            completed: false
          }
        ],
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
    description: `Personalized plan to achieve ${request.targetLevel} level`,
    domainId: request.domainId,
    status: 'active',
    modules: [
      {
        id: `module-${Date.now()}-1`,
        title: 'Getting Started',
        description: 'Introduction to your learning journey',
        order: 1,
        resources: [
          {
            id: `resource-${Date.now()}-1`,
            type: 'article',
            title: 'Welcome to Your Learning Plan',
            description: 'Overview and expectations',
            completed: false
          }
        ],
        estimatedHours: 10
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  
  mockLearningPlans.push(newPlan)
  return newPlan
}
