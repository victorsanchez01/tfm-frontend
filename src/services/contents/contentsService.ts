//
//  contentsService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { httpClient, USE_REAL_API } from '../api/httpClient'

export interface Content {
  id: string
  title: string
  description: string
  type: 'course' | 'lesson' | 'video' | 'article' | 'quiz'
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
  duration: number // in minutes
  progress: number // 0-100
  status: 'not_started' | 'in_progress' | 'completed'
  thumbnail: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Course extends Content {
  type: 'course'
  lessons: Lesson[]
  totalLessons: number
  completedLessons: number
}

export interface Lesson extends Content {
  type: 'lesson'
  courseId: string
  videoUrl?: string
  resources: Resource[]
}

export interface Resource {
  id: string
  title: string
  type: 'pdf' | 'link' | 'code' | 'download'
  url: string
}

// Backend DTOs
interface BackendContentItem {
  id: string
  title: string
  description: string
  contentType: string
  difficulty: string
  estimatedMinutes: number
  domainId?: string
  metadata?: Record<string, unknown>
  active?: boolean
  createdAt: string
  updatedAt: string
}

interface BackendPage<T> {
  content: T[]
  totalElements: number
  totalPages: number
}

interface BackendTrackingEvent {
  userId: string
  contentItemId: string
  eventType: string
  timestamp?: string
}

const mapContentType = (contentType: string): Content['type'] => {
  const map: Record<string, Content['type']> = {
    COURSE: 'course',
    VIDEO: 'video',
    ARTICLE: 'article',
    QUIZ: 'quiz',
    LESSON: 'lesson',
  }
  return map[contentType?.toUpperCase()] || 'course'
}

const mapDifficulty = (difficulty: string): Content['level'] => {
  const map: Record<string, Content['level']> = {
    BEGINNER: 'beginner',
    INTERMEDIATE: 'intermediate',
    ADVANCED: 'advanced',
  }
  return map[difficulty?.toUpperCase()] || 'beginner'
}

const adaptContent = (item: BackendContentItem): Content => ({
  id: item.id,
  title: item.title,
  description: item.description,
  type: mapContentType(item.contentType),
  category: item.domainId || 'General',
  level: mapDifficulty(item.difficulty),
  duration: item.estimatedMinutes || 0,
  progress: 0,
  status: 'not_started',
  thumbnail: '',
  tags: [],
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
})

// Real API implementation
const getContentsAPI = async (): Promise<Content[]> => {
  const page = await httpClient.get<BackendPage<BackendContentItem>>(
    '/content/content-items?page=0&size=50'
  )
  return page.content.map(adaptContent)
}

const getContentAPI = async (id: string): Promise<Content | null> => {
  const item = await httpClient
    .get<BackendContentItem>(`/content/content-items/${id}`)
    .catch(() => null)
  return item ? adaptContent(item) : null
}

const updateProgressAPI = async (id: string, progress: number): Promise<Content> => {
  const userId = localStorage.getItem('user_id') || ''
  const eventType = progress >= 100 ? 'CONTENT_COMPLETED' : 'CONTENT_STARTED'
  const event: BackendTrackingEvent = {
    userId,
    contentItemId: id,
    eventType,
    timestamp: new Date().toISOString(),
  }
  await httpClient.post('/tracking/events', event)
  const content = await getContentAPI(id)
  if (!content) throw new Error('Content not found')
  content.progress = progress
  content.status = progress >= 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started'
  return content
}

// Mock data
const mockContents: Content[] = [
  {
    id: '1',
    title: 'React Hooks Fundamentals',
    description: 'Aprende los fundamentos de React Hooks incluyendo useState, useEffect y custom hooks',
    type: 'course',
    category: 'Frontend',
    level: 'intermediate',
    duration: 240,
    progress: 65,
    status: 'in_progress',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    tags: ['react', 'hooks', 'javascript'],
    createdAt: '2024-01-01',
    updatedAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'TypeScript Avanzado',
    description: 'Dominio de TypeScript con tipos avanzados, generics y patrones de diseño',
    type: 'course',
    category: 'Lenguajes',
    level: 'advanced',
    duration: 320,
    progress: 30,
    status: 'in_progress',
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400',
    tags: ['typescript', 'types', 'patterns'],
    createdAt: '2024-01-05',
    updatedAt: '2024-01-20',
  },
  {
    id: '3',
    title: 'CSS Grid Layout',
    description: 'Aprende a crear layouts complejos y responsivos con CSS Grid',
    type: 'lesson',
    category: 'CSS',
    level: 'beginner',
    duration: 45,
    progress: 100,
    status: 'completed',
    thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    tags: ['css', 'grid', 'layout'],
    createdAt: '2023-12-15',
    updatedAt: '2023-12-20',
  },
  {
    id: '4',
    title: 'Node.js y Express',
    description: 'Construye APIs RESTful con Node.js y Express desde cero',
    type: 'course',
    category: 'Backend',
    level: 'intermediate',
    duration: 280,
    progress: 0,
    status: 'not_started',
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400',
    tags: ['nodejs', 'express', 'api'],
    createdAt: '2024-01-10',
    updatedAt: '2024-01-10',
  },
]

export const contentsService = {
  async getContents(): Promise<Content[]> {
    if (USE_REAL_API) return getContentsAPI()
    await new Promise(resolve => setTimeout(resolve, 500))
    return [...mockContents]
  },

  async getContent(id: string): Promise<Content | null> {
    if (USE_REAL_API) return getContentAPI(id)
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockContents.find(c => c.id === id) || null
  },

  async getCourses(): Promise<Course[]> {
    const contents = await this.getContents()
    return contents.filter(c => c.type === 'course') as Course[]
  },

  async getLessons(): Promise<Lesson[]> {
    const contents = await this.getContents()
    return contents.filter(c => c.type === 'lesson') as Lesson[]
  },

  async updateProgress(id: string, progress: number): Promise<Content> {
    if (USE_REAL_API) return updateProgressAPI(id, progress)
    await new Promise(resolve => setTimeout(resolve, 600))
    const content = mockContents.find(c => c.id === id)
    if (!content) throw new Error('Content not found')
    content.progress = progress
    content.status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started'
    content.updatedAt = new Date().toISOString().split('T')[0]
    return { ...content }
  },

  async getContentsByCategory(category: string): Promise<Content[]> {
    const contents = await this.getContents()
    return contents.filter(c => c.category === category)
  },

  async getContentsByLevel(level: string): Promise<Content[]> {
    const contents = await this.getContents()
    return contents.filter(c => c.level === level)
  },

  async searchContents(query: string): Promise<Content[]> {
    const contents = await this.getContents()
    const lowercaseQuery = query.toLowerCase()
    return contents.filter(
      c =>
        c.title.toLowerCase().includes(lowercaseQuery) ||
        c.description.toLowerCase().includes(lowercaseQuery) ||
        c.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  },
}
