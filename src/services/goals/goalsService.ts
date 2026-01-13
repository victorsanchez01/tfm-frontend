//
//  goalsService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

export interface Goal {
  id: string
  title: string
  description: string
  targetDate: string
  status: 'active' | 'completed' | 'paused'
  progress: number
  category: 'career' | 'skill' | 'project' | 'certification'
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
    description: 'Obtener la certificación fundamental de AWS para entender los conceptos básicos de la nube',
    targetDate: '2024-02-28',
    status: 'active',
    progress: 40,
    category: 'certification',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-20',
    milestones: [
      { id: '2-1', title: 'Completar módulo 1-3 del curso', completed: true },
      { id: '2-2', title: 'Prácticas en consola AWS', completed: false },
      { id: '2-3', title: 'Examen simulado', completed: false },
    ],
  },
  {
    id: '3',
    title: 'Portfolio Full-Stack',
    description: 'Crear un portfolio completo con 5 proyectos destacados',
    targetDate: '2024-04-30',
    status: 'paused',
    progress: 20,
    category: 'project',
    createdAt: '2023-12-15',
    updatedAt: '2024-01-10',
    milestones: [
      { id: '3-1', title: 'Diseñar layout del portfolio', completed: true },
      { id: '3-2', title: 'Desarrollar 3 proyectos', completed: false },
      { id: '3-3', title: 'Configurar dominio y hosting', completed: false },
    ],
  },
]

export const goalsService = {
  async getGoals(): Promise<Goal[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return [...mockGoals]
  },

  async getGoal(id: string): Promise<Goal | null> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockGoals.find(g => g.id === id) || null
  },

  async createGoal(data: CreateGoalData): Promise<Goal> {
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
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const goalIndex = mockGoals.findIndex(g => g.id === id)
    if (goalIndex === -1) throw new Error('Goal not found')
    
    mockGoals[goalIndex] = {
      ...mockGoals[goalIndex],
      ...data,
      updatedAt: new Date().toISOString().split('T')[0],
    }
    
    return { ...mockGoals[goalIndex] }
  },

  async deleteGoal(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const index = mockGoals.findIndex(g => g.id === id)
    if (index === -1) throw new Error('Goal not found')
    
    mockGoals.splice(index, 1)
  },

  async updateMilestone(goalId: string, milestoneId: string, completed: boolean): Promise<Goal> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    const goal = mockGoals.find(g => g.id === goalId)
    if (!goal) throw new Error('Goal not found')
    
    const milestone = goal.milestones.find(m => m.id === milestoneId)
    if (!milestone) throw new Error('Milestone not found')
    
    milestone.completed = completed
    milestone.completedAt = completed ? new Date().toISOString().split('T')[0] : undefined
    
    // Update progress based on completed milestones
    const completedCount = goal.milestones.filter(m => m.completed).length
    goal.progress = goal.milestones.length > 0 ? Math.round((completedCount / goal.milestones.length) * 100) : 0
    
    return { ...goal }
  },
}
