//
//  ContentGrid.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { type Content } from '../../../services/contents/contentsService'
import { ContentCard } from './index'
import styles from './ContentGrid.module.css'

interface ContentGridProps {
  contents: Content[]
  onContentClick: (content: Content) => void
}

export function ContentGrid({ contents, onContentClick }: ContentGridProps) {
  if (contents.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 className={styles.emptyTitle}>No se encontraron contenidos</h3>
        <p className={styles.emptyDescription}>
          Intenta ajustar los filtros o el término de búsqueda
        </p>
      </div>
    )
  }

  return (
    <div className={styles.grid}>
      {contents.map((content) => (
        <ContentCard
          key={content.id}
          content={content}
          onClick={() => onContentClick(content)}
        />
      ))}
    </div>
  )
}
