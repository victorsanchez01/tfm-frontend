//
//  ContentCard.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { type Content } from '../../../services/contents/contentsService'
import styles from './ContentCard.module.css'

interface ContentCardProps {
  content: Content
  onClick: () => void
}

export function ContentCard({ content, onClick }: ContentCardProps) {
  const getTypeIcon = (type: Content['type']) => {
    switch (type) {
      case 'course':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        )
      case 'lesson':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        )
      case 'video':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'article':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )
      case 'quiz':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      default:
        return null
    }
  }

  const getTypeLabel = (type: Content['type']) => {
    switch (type) {
      case 'course':
        return 'Curso'
      case 'lesson':
        return 'Lección'
      case 'video':
        return 'Video'
      case 'article':
        return 'Artículo'
      case 'quiz':
        return 'Quiz'
      default:
        return type
    }
  }

  const getLevelColor = (level: Content['level']) => {
    switch (level) {
      case 'beginner':
        return styles.levelBeginner
      case 'intermediate':
        return styles.levelIntermediate
      case 'advanced':
        return styles.levelAdvanced
      default:
        return styles.levelBeginner
    }
  }

  const getLevelLabel = (level: Content['level']) => {
    switch (level) {
      case 'beginner':
        return 'Principiante'
      case 'intermediate':
        return 'Intermedio'
      case 'advanced':
        return 'Avanzado'
      default:
        return level
    }
  }

  const getStatusColor = (status: Content['status']) => {
    switch (status) {
      case 'not_started':
        return styles.statusNotStarted
      case 'in_progress':
        return styles.statusInProgress
      case 'completed':
        return styles.statusCompleted
      default:
        return styles.statusNotStarted
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.thumbnail}>
        <img src={content.thumbnail} alt={content.title} />
        <div className={styles.typeBadge}>
          {getTypeIcon(content.type)}
          <span>{getTypeLabel(content.type)}</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}>{content.title}</h3>
          <div className={styles.badges}>
            <span className={`${styles.levelBadge} ${getLevelColor(content.level)}`}>
              {getLevelLabel(content.level)}
            </span>
            <span className={`${styles.statusBadge} ${getStatusColor(content.status)}`}>
              {content.status === 'not_started' ? 'No iniciado' : 
               content.status === 'in_progress' ? 'En progreso' : 'Completado'}
            </span>
          </div>
        </div>

        <p className={styles.description}>{content.description}</p>

        <div className={styles.meta}>
          <div className={styles.instructor}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{content.instructor}</span>
          </div>
          <div className={styles.duration}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{formatDuration(content.duration)}</span>
          </div>
        </div>

        {content.progress > 0 && (
          <div className={styles.progress}>
            <div className={styles.progressHeader}>
              <span className={styles.progressLabel}>Progreso</span>
              <span className={styles.progressValue}>{content.progress}%</span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${content.progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className={styles.tags}>
          {content.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
