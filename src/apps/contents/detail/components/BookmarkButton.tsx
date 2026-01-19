//
//  BookmarkButton.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useState } from 'react'
import styles from './BookmarkButton.module.css'

interface BookmarkButtonProps {
  isBookmarked: boolean
  onToggle: () => void
  showLink?: boolean
}

export function BookmarkButton({ isBookmarked, onToggle, showLink = false }: BookmarkButtonProps) {
  const [animating, setAnimating] = useState(false)

  const handleClick = () => {
    setAnimating(true)
    onToggle()
    setTimeout(() => setAnimating(false), 300)
  }

  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.bookmark} ${isBookmarked ? styles.bookmarked : ''} ${animating ? styles.animating : ''}`}
        onClick={handleClick}
        title={isBookmarked ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill={isBookmarked ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2v16z" />
        </svg>
        <span>{isBookmarked ? 'Guardado' : 'Guardar'}</span>
      </button>
      
      {showLink && isBookmarked && (
        <a href="/favorites" className={styles.link}>
          Ver todos los guardados
        </a>
      )}
    </div>
  )
}
