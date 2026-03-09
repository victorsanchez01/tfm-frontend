//
//  bookmarksService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { httpClient, USE_REAL_API } from '../api/httpClient'
import { type Content } from '../contents/contentsService'

export interface Bookmark {
  id: string
  contentId: string
  userId: string
  createdAt: string
  content: Content
}

// Backend DTOs
interface BackendEvent {
  id: string
  eventType: string
  entityId: string
  occurredAt: string
}

interface BackendEventPage {
  content: BackendEvent[]
}

interface BackendContentItem {
  id: string
  title: string
  description: string
  type: string
  difficulty: number
  estimatedMinutes: number
  domain?: { name: string }
  metadata?: { thumbnail?: string; tags?: string[] }
  createdAt: string
  updatedAt: string
}

const mapLevel = (d: number): Content['level'] =>
  d <= 0.33 ? 'beginner' : d <= 0.66 ? 'intermediate' : 'advanced'

const mapType = (t: string): Content['type'] => {
  const map: Record<string, Content['type']> = {
    COURSE: 'course', VIDEO: 'video', ARTICLE: 'article', QUIZ: 'quiz', LESSON: 'lesson',
  }
  return map[t?.toUpperCase()] || 'course'
}

const adaptItem = (item: BackendContentItem): Content => ({
  id: item.id,
  title: item.title,
  description: item.description,
  type: mapType(item.type),
  category: item.domain?.name || 'General',
  level: mapLevel(item.difficulty ?? 0),
  duration: item.estimatedMinutes || 0,
  progress: 0,
  status: 'not_started',
  thumbnail: (item.metadata?.thumbnail as string) || '',
  tags: (item.metadata?.tags as string[]) || [],
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
})

/** Fetches all bookmark events for the user and returns the set of currently-bookmarked contentIds.
 *  A content is bookmarked if the latest event for that entityId is CONTENT_BOOKMARK. */
const fetchBookmarkedIds = async (userId: string): Promise<Set<string>> => {
  const page = await httpClient
    .get<BackendEventPage>(
      `/tracking/events?userId=${userId}&entityType=content_item&page=0&size=500`
    )
    .catch(() => ({ content: [] as BackendEvent[] }))

  const events = page.content ?? []
  const latestByEntity = new Map<string, BackendEvent>()
  for (const e of events) {
    if (!e.entityId) continue
    if (e.eventType !== 'CONTENT_BOOKMARK' && e.eventType !== 'CONTENT_UNBOOKMARK') continue
    const existing = latestByEntity.get(e.entityId)
    if (!existing || new Date(e.occurredAt) > new Date(existing.occurredAt)) {
      latestByEntity.set(e.entityId, e)
    }
  }

  const bookmarked = new Set<string>()
  for (const [id, event] of latestByEntity) {
    if (event.eventType === 'CONTENT_BOOKMARK') bookmarked.add(id)
  }
  return bookmarked
}

const postBookmarkEvent = async (contentId: string, eventType: 'CONTENT_BOOKMARK' | 'CONTENT_UNBOOKMARK') => {
  const userId = localStorage.getItem('user_id') || ''
  const now = new Date().toISOString()
  await httpClient.post('/tracking/events', {
    userId,
    eventType,
    entityType: 'content_item',
    entityId: contentId,
    occurredAt: now,
    payload: JSON.stringify({ contentItemId: contentId, timestamp: now }),
  })
}

// Real API implementation
const getBookmarksAPI = async (): Promise<Bookmark[]> => {
  const userId = localStorage.getItem('user_id') || ''
  const [bookmarkedIds, allItems] = await Promise.all([
    fetchBookmarkedIds(userId),
    httpClient
      .get<BackendContentItem[]>('/content/content-items?page=0&size=100')
      .catch(() => [] as BackendContentItem[]),
  ])

  if (bookmarkedIds.size === 0) return []

  return (Array.isArray(allItems) ? allItems : [])
    .filter(item => bookmarkedIds.has(item.id))
    .map((item) => ({
      id: `bm-${item.id}`,
      contentId: item.id,
      userId,
      createdAt: new Date().toISOString(),
      content: adaptItem(item),
    }))
}

const isBookmarkedAPI = async (contentId: string): Promise<boolean> => {
  const userId = localStorage.getItem('user_id') || ''
  const bookmarkedIds = await fetchBookmarkedIds(userId)
  return bookmarkedIds.has(contentId)
}

export const bookmarksService = {
  async getBookmarks(): Promise<Bookmark[]> {
    if (USE_REAL_API) return getBookmarksAPI()
    return []
  },

  async addBookmark(contentId: string): Promise<void> {
    if (USE_REAL_API) {
      await postBookmarkEvent(contentId, 'CONTENT_BOOKMARK')
      return
    }
  },

  async removeBookmark(contentId: string): Promise<void> {
    if (USE_REAL_API) {
      await postBookmarkEvent(contentId, 'CONTENT_UNBOOKMARK')
      return
    }
  },

  async isBookmarked(contentId: string): Promise<boolean> {
    if (USE_REAL_API) return isBookmarkedAPI(contentId)
    return false
  },
}
