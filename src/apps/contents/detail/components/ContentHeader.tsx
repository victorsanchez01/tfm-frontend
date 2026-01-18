//
//  ContentHeader.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useNavigate } from 'react-router-dom'
import { type Content } from '../../../../services/contents/contentsService'
import styles from './ContentHeader.module.css'

interface ContentHeaderProps {
  content: Content
}

export function ContentHeader({ content }: ContentHeaderProps) {
  const navigate = useNavigate()

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

  return (
    <div className={styles.header}>
      <div className={styles.background}>
        <img src={content.thumbnail} alt={content.title} />
        <div className={styles.overlay}></div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.breadcrumb}>
          <button onClick={() => navigate('/contents')} className={styles.backLink}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al catálogo
          </button>
        </div>

        <div className={styles.info}>
          <div className={styles.meta}>
            <span className={styles.type}>{getTypeLabel(content.type)}</span>
            <span className={`${styles.level} ${getLevelColor(content.level)}`}>
              {getLevelLabel(content.level)}
            </span>
          </div>
          
          <h1 className={styles.title}>{content.title}</h1>
          
          <div className={styles.stats}>
            <div className={styles.stat}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{Math.floor(content.duration / 60)}h {content.duration % 60}m</span>
            </div>
            <div className={styles.stat}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{content.instructor}</span>
            </div>
            <div className={styles.stat}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                {content.status === 'not_started' ? 'No iniciado' :
                 content.status === 'in_progress' ? `${content.progress}% en progreso` : 'Completado'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
