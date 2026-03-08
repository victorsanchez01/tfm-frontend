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
interface BackendDomain {
  code: string
  name: string
  description?: string
}

interface BackendContentItem {
  id: string
  title: string
  description: string
  type: string
  difficulty: number
  estimatedMinutes: number
  domain?: BackendDomain
  metadata?: Record<string, unknown>
  isActive?: boolean
  createdAt: string
  updatedAt: string
}

interface BackendEvent {
  id: string
  userId: string
  eventType: string
  entityType?: string
  entityId?: string
  occurredAt: string
}

interface BackendEventPage {
  content: BackendEvent[]
  totalElements: number
}

type ContentStatusEntry = { status: Content['status']; progress: number }

const statusFromEvents = (events: BackendEvent[]): ContentStatusEntry => {
  const hasCompleted = events.some(e => e.eventType === 'CONTENT_COMPLETE')
  const hasStarted = events.some(e => e.eventType === 'CONTENT_START')
  if (hasCompleted) return { status: 'completed', progress: 100 }
  if (hasStarted) return { status: 'in_progress', progress: 50 }
  return { status: 'not_started', progress: 0 }
}

const fetchContentStatusMap = async (userId: string): Promise<Map<string, ContentStatusEntry>> => {
  if (!userId) return new Map()
  const response = await httpClient
    .get<BackendEventPage>(`/tracking/events?userId=${userId}&entityType=content_item&page=0&size=200`)
    .catch(() => ({ content: [] as BackendEvent[], totalElements: 0 }))

  const events = response.content ?? []
  const grouped = new Map<string, BackendEvent[]>()
  for (const event of events) {
    if (!event.entityId) continue
    const list = grouped.get(event.entityId) ?? []
    list.push(event)
    grouped.set(event.entityId, list)
  }

  const result = new Map<string, ContentStatusEntry>()
  for (const [entityId, evts] of grouped) {
    result.set(entityId, statusFromEvents(evts))
  }
  return result
}

const postTrackingEvent = async (contentId: string, eventType: 'CONTENT_START' | 'CONTENT_COMPLETE') => {
  const userId = localStorage.getItem('user_id') || ''
  const now = new Date().toISOString()
  const payloadObj = eventType === 'CONTENT_START'
    ? { contentItemId: contentId, startTime: now }
    : { contentItemId: contentId, completionTime: now, timeSpentMs: 0 }
  await httpClient.post('/tracking/events', {
    userId,
    eventType,
    entityType: 'content_item',
    entityId: contentId,
    occurredAt: now,
    payload: JSON.stringify(payloadObj),
  })
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

const mapDifficulty = (difficulty: number): Content['level'] => {
  if (difficulty <= 0.33) return 'beginner'
  if (difficulty <= 0.66) return 'intermediate'
  return 'advanced'
}

const adaptContent = (item: BackendContentItem, statusEntry?: ContentStatusEntry): Content => {
  const { status, progress } = statusEntry ?? { status: 'not_started' as const, progress: 0 }
  return {
    id: item.id,
    title: item.title,
    description: item.description,
    type: mapContentType(item.type),
    category: item.domain?.name || 'General',
    level: mapDifficulty(item.difficulty ?? 0),
    duration: item.estimatedMinutes || 0,
    progress,
    status,
    thumbnail: (item.metadata?.thumbnail as string) || '',
    tags: (item.metadata?.tags as string[]) || [],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }
}

const getContentsAPI = async (): Promise<Content[]> => {
  const userId = localStorage.getItem('user_id') || ''
  const [items, statusMap] = await Promise.all([
    httpClient.get<BackendContentItem[]>('/content/content-items?page=0&size=50'),
    fetchContentStatusMap(userId),
  ])
  return items.map(item => adaptContent(item, statusMap.get(item.id)))
}

const getContentAPI = async (id: string): Promise<Content | null> => {
  const userId = localStorage.getItem('user_id') || ''
  const [item, statusMap] = await Promise.all([
    httpClient.get<BackendContentItem>(`/content/content-items/${id}`).catch(() => null),
    fetchContentStatusMap(userId),
  ])
  return item ? adaptContent(item, statusMap.get(id)) : null
}

export const startContent = async (id: string): Promise<void> => {
  await postTrackingEvent(id, 'CONTENT_START')
}

export const completeContent = async (id: string): Promise<void> => {
  await postTrackingEvent(id, 'CONTENT_COMPLETE')
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

  async updateProgress(): Promise<void> {
    // Progress is now managed via startContent / completeContent
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
