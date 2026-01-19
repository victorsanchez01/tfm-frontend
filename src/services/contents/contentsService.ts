//
//  contentsService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

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
  {
    id: '5',
    title: 'Introducción a Python',
    description: 'Los fundamentos de programación con Python',
    type: 'video',
    category: 'Python',
    level: 'beginner',
    duration: 60,
    progress: 0,
    status: 'not_started',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400',
    tags: ['python', 'programming', 'basics'],
    createdAt: '2024-01-12',
    updatedAt: '2024-01-12',
  },
]

const mockCourses: Course[] = [
  {
    ...mockContents[0],
    type: 'course',
    totalLessons: 5,
    completedLessons: 3,
    lessons: [
      {
        id: '1-1',
        title: 'Introducción a los Hooks',
        description: 'Conceptos básicos y motivación detrás de React Hooks',
        type: 'lesson',
        category: 'Frontend',
        level: 'intermediate',
        duration: 30,
        progress: 100,
        status: 'completed',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
        tags: ['react', 'hooks'],
        createdAt: '2024-01-01',
        updatedAt: '2024-01-02',
        courseId: '1',
        resources: [],
      },
      {
        id: '1-2',
        title: 'useState y useEffect',
        description: 'Los hooks más fundamentales de React',
        type: 'lesson',
        category: 'Frontend',
        level: 'intermediate',
        duration: 45,
        progress: 100,
        status: 'completed',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
        tags: ['react', 'hooks', 'state'],
        createdAt: '2024-01-03',
        updatedAt: '2024-01-04',
        courseId: '1',
        resources: [],
      },
      {
        id: '1-3',
        title: 'useContext y useReducer',
        description: 'Manejo de estado complejo con hooks',
        type: 'lesson',
        category: 'Frontend',
        level: 'intermediate',
        duration: 50,
        progress: 100,
        status: 'completed',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
        tags: ['react', 'hooks', 'context'],
        createdAt: '2024-01-05',
        updatedAt: '2024-01-06',
        courseId: '1',
        resources: [],
      },
      {
        id: '1-4',
        title: 'Custom Hooks',
        description: 'Creando tus propios hooks reutilizables',
        type: 'lesson',
        category: 'Frontend',
        level: 'intermediate',
        duration: 55,
        progress: 50,
        status: 'in_progress',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
        tags: ['react', 'hooks', 'custom'],
        createdAt: '2024-01-07',
        updatedAt: '2024-01-08',
        courseId: '1',
        resources: [],
      },
      {
        id: '1-5',
        title: 'Hooks Optimización',
        description: 'useMemo, useCallback y patrones de optimización',
        type: 'lesson',
        category: 'Frontend',
        level: 'intermediate',
        duration: 60,
        progress: 0,
        status: 'not_started',
        thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
        tags: ['react', 'hooks', 'optimization'],
        createdAt: '2024-01-09',
        updatedAt: '2024-01-10',
        courseId: '1',
        resources: [],
      },
    ],
  },
  {
    ...mockContents[1],
    type: 'course',
    totalLessons: 6,
    completedLessons: 2,
    lessons: [
      {
        id: '2-1',
        title: 'Tipos Básicos y Avanzados',
        description: 'Deep dive en el sistema de tipos de TypeScript',
        type: 'lesson',
        category: 'Lenguajes',
        level: 'advanced',
        duration: 40,
        progress: 100,
        status: 'completed',
        thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400',
        tags: ['typescript', 'types'],
        createdAt: '2024-01-05',
        updatedAt: '2024-01-06',
        courseId: '2',
        resources: [],
      },
      {
        id: '2-2',
        title: 'Generics y Tipos Condicionales',
        description: 'Creando tipos flexibles y reutilizables',
        type: 'lesson',
        category: 'Lenguajes',
        level: 'advanced',
        duration: 50,
        progress: 100,
        status: 'completed',
        thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400',
        tags: ['typescript', 'generics'],
        createdAt: '2024-01-07',
        updatedAt: '2024-01-08',
        courseId: '2',
        resources: [],
      },
      {
        id: '2-3',
        title: 'Decoradores y Metaprogramación',
        description: 'Añadiendo metadatos y comportamiento con decoradores',
        type: 'lesson',
        category: 'Lenguajes',
        level: 'advanced',
        duration: 60,
        progress: 0,
        status: 'not_started',
        thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400',
        tags: ['typescript', 'decorators'],
        createdAt: '2024-01-09',
        updatedAt: '2024-01-10',
        courseId: '2',
        resources: [],
      },
      {
        id: '2-4',
        title: 'Patrones de Diseño en TypeScript',
        description: 'Implementando patrones comunes con TypeScript',
        type: 'lesson',
        category: 'Lenguajes',
        level: 'advanced',
        duration: 55,
        progress: 0,
        status: 'not_started',
        thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400',
        tags: ['typescript', 'patterns'],
        createdAt: '2024-01-11',
        updatedAt: '2024-01-12',
        courseId: '2',
        resources: [],
      },
      {
        id: '2-5',
        title: 'TypeScript con React',
        description: 'Tipado robusto en aplicaciones React',
        type: 'lesson',
        category: 'Lenguajes',
        level: 'advanced',
        duration: 50,
        progress: 0,
        status: 'not_started',
        thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400',
        tags: ['typescript', 'react'],
        createdAt: '2024-01-13',
        updatedAt: '2024-01-14',
        courseId: '2',
        resources: [],
      },
      {
        id: '2-6',
        title: 'Proyecto Final',
        description: 'Construyendo una librería con TypeScript',
        type: 'lesson',
        category: 'Lenguajes',
        level: 'advanced',
        duration: 65,
        progress: 0,
        status: 'not_started',
        thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400',
        tags: ['typescript', 'project'],
        createdAt: '2024-01-15',
        updatedAt: '2024-01-16',
        courseId: '2',
        resources: [],
      },
    ],
  },
]

export const contentsService = {
  async getContents(): Promise<Content[]> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return [...mockContents]
  },

  async getContent(id: string): Promise<Content | null> {
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // First try to find in courses
    const course = mockCourses.find(c => c.id === id)
    if (course) return course
    
    // Then try in general contents
    return mockContents.find(c => c.id === id) || null
  },

  async getCourses(): Promise<Course[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return mockContents.filter(c => c.type === 'course') as Course[]
  },

  async getLessons(): Promise<Lesson[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return mockContents.filter(c => c.type === 'lesson') as Lesson[]
  },

  async updateProgress(id: string, progress: number): Promise<Content> {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const content = mockContents.find(c => c.id === id)
    if (!content) throw new Error('Content not found')
    
    content.progress = progress
    content.status = progress === 100 ? 'completed' : progress > 0 ? 'in_progress' : 'not_started'
    content.updatedAt = new Date().toISOString().split('T')[0]
    
    return { ...content }
  },

  async getContentsByCategory(category: string): Promise<Content[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return mockContents.filter(c => c.category === category)
  },

  async getContentsByLevel(level: string): Promise<Content[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return mockContents.filter(c => c.level === level)
  },

  async searchContents(query: string): Promise<Content[]> {
    await new Promise(resolve => setTimeout(resolve, 500))
    const lowercaseQuery = query.toLowerCase()
    return mockContents.filter(c => 
      c.title.toLowerCase().includes(lowercaseQuery) ||
      c.description.toLowerCase().includes(lowercaseQuery) ||
      c.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  },
}
