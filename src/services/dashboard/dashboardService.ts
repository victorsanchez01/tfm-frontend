//
//  dashboardService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

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

export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    // Simulate API delay
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
    // Simulate API delay
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
      {
        id: '4',
        type: 'completed',
        title: 'Completaste: CSS Grid y Flexbox',
        detail: 'Lección 5 de 8',
        time: 'hace 5 días',
      },
      {
        id: '5',
        type: 'created',
        title: 'Nuevo objetivo: Dominar Node.js',
        detail: 'Plazo: 60 días',
        time: 'hace 1 semana',
      },
    ]
  },
}
