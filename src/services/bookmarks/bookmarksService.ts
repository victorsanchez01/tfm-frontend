//
//  bookmarksService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { type Content } from '../contents/contentsService'

export interface Bookmark {
  id: string
  contentId: string
  userId: string
  createdAt: string
  content: Content
}

const mockBookmarks: Bookmark[] = [
  {
    id: '1',
    contentId: '1',
    userId: 'user-1',
    createdAt: '2024-01-10T10:00:00Z',
    content: {
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
  },
  {
    id: '2',
    contentId: '3',
    userId: 'user-1',
    createdAt: '2024-01-12T14:30:00Z',
    content: {
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
  },
]

export const bookmarksService = {
  async getBookmarks(userId: string): Promise<Bookmark[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockBookmarks.filter(b => b.userId === userId)
  },

  async addBookmark(userId: string, contentId: string, content: Content): Promise<Bookmark> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const newBookmark: Bookmark = {
      id: Date.now().toString(),
      contentId,
      userId,
      createdAt: new Date().toISOString(),
      content,
    }
    
    mockBookmarks.push(newBookmark)
    return newBookmark
  },

  async removeBookmark(userId: string, contentId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))
    
    const index = mockBookmarks.findIndex(
      b => b.userId === userId && b.contentId === contentId
    )
    
    if (index > -1) {
      mockBookmarks.splice(index, 1)
    }
  },

  async isBookmarked(userId: string, contentId: string): Promise<boolean> {
    await new Promise(resolve => setTimeout(resolve, 100))
    return mockBookmarks.some(b => b.userId === userId && b.contentId === contentId)
  },
}
