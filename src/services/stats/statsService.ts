//
//  statsService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

export interface StudyTimeData {
  date: string
  minutes: number
}

export interface ProgressData {
  category: string
  completed: number
  total: number
  percentage: number
}

export interface ActivityData {
  date: string
  activities: number
}

export interface MonthlyProgressData {
  month: string
  totalHours: number
  progressPercentage: number
  completedContents: number
}

export interface StatsOverview {
  totalStudyTime: number // in minutes
  streakDays: number
  completedCourses: number
  inProgressCourses: number
  weeklyGoal: number
  weeklyProgress: number
}

const generateMockStudyTime = (): StudyTimeData[] => {
  const data: StudyTimeData[] = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toISOString().split('T')[0],
      minutes: Math.floor(Math.random() * 120) + 20, // 20-140 minutes per day
    })
  }
  
  return data
}

const generateMockProgress = (): ProgressData[] => {
  return [
    { category: 'Frontend', completed: 3, total: 5, percentage: 60 },
    { category: 'Backend', completed: 1, total: 3, percentage: 33 },
    { category: 'Lenguajes', completed: 2, total: 4, percentage: 50 },
    { category: 'CSS', completed: 4, total: 4, percentage: 100 },
    { category: 'Python', completed: 0, total: 2, percentage: 0 },
  ]
}

const generateMockActivity = (): ActivityData[] => {
  const data: ActivityData[] = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.push({
      date: date.toLocaleDateString('es', { weekday: 'short' }),
      activities: Math.floor(Math.random() * 8) + 1, // 1-8 activities per day
    })
  }
  
  return data
}

const generateMockMonthlyProgress = (): MonthlyProgressData[] => {
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun']
  return months.map((month) => ({
    month,
    totalHours: Math.floor(Math.random() * 40) + 10,
    progressPercentage: Math.floor(Math.random() * 40) + 60,
    completedContents: Math.floor(Math.random() * 5) + 2,
  }))
}

export const statsService = {
  async getOverview(): Promise<StatsOverview> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return {
      totalStudyTime: 2450, // ~40 hours
      streakDays: 12,
      completedCourses: 2,
      inProgressCourses: 3,
      weeklyGoal: 600, // 10 hours
      weeklyProgress: 420, // 7 hours
    }
  },

  async getStudyTime(days: number = 30): Promise<StudyTimeData[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    
    const allData = generateMockStudyTime()
    return allData.slice(-days)
  },

  async getProgressByCategory(): Promise<ProgressData[]> {
    await new Promise(resolve => setTimeout(resolve, 350))
    return generateMockProgress()
  },

  async getWeeklyActivity(): Promise<ActivityData[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return generateMockActivity()
  },

  async getMonthlyProgress(): Promise<MonthlyProgressData[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return generateMockMonthlyProgress()
  },
}
