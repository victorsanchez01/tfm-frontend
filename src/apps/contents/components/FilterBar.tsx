//
//  FilterBar.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import styles from './FilterBar.module.css'

interface FilterBarProps {
  categories: string[]
  levels: string[]
  selectedCategory: string
  selectedLevel: string
  onCategoryChange: (category: string) => void
  onLevelChange: (level: string) => void
}

export function FilterBar({
  categories,
  levels,
  selectedCategory,
  selectedLevel,
  onCategoryChange,
  onLevelChange,
}: FilterBarProps) {
  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <div className={styles.filter}>
          <label className={styles.label}>Categoría</label>
          <select
            className={styles.select}
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'Todas las categorías' : category}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filter}>
          <label className={styles.label}>Nivel</label>
          <select
            className={styles.select}
            value={selectedLevel}
            onChange={(e) => onLevelChange(e.target.value)}
          >
            {levels.map((level) => (
              <option key={level} value={level}>
                {level === 'all' 
                  ? 'Todos los niveles' 
                  : level === 'beginner' 
                    ? 'Principiante' 
                    : level === 'intermediate' 
                      ? 'Intermedio' 
                      : 'Avanzado'
                }
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
