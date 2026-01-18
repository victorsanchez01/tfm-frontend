//
//  ContentTabs.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import styles from './ContentTabs.module.css'

interface ContentTabsProps {
  activeTab: 'overview' | 'lessons' | 'resources'
  onTabChange: (tab: 'overview' | 'lessons' | 'resources') => void
  isCourse: boolean
  hasResources: boolean
}

export function ContentTabs({
  activeTab,
  onTabChange,
  isCourse,
  hasResources,
}: ContentTabsProps) {
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
        onClick={() => onTabChange('overview')}
      >
        Descripción
      </button>
      
      {isCourse && (
        <button
          className={`${styles.tab} ${activeTab === 'lessons' ? styles.active : ''}`}
          onClick={() => onTabChange('lessons')}
        >
          Lecciones
        </button>
      )}
      
      {hasResources && (
        <button
          className={`${styles.tab} ${activeTab === 'resources' ? styles.active : ''}`}
          onClick={() => onTabChange('resources')}
        >
          Recursos
        </button>
      )}
    </div>
  )
}
