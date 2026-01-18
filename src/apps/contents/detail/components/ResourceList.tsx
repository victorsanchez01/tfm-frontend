//
//  ResourceList.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import styles from './ResourceList.module.css'

interface Resource {
  id: string
  title: string
  type: 'pdf' | 'link' | 'code' | 'download'
  url: string
}

interface ResourceListProps {
  resources: Resource[]
}

export function ResourceList({ resources }: ResourceListProps) {
  if (resources.length === 0) {
    return (
      <div className={styles.empty}>
        <h3>Recursos del curso</h3>
        <p>No hay recursos disponibles para este contenido.</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h3>Recursos del curso</h3>
      <div className={styles.resources}>
        {resources.map((resource) => (
          <a
            key={resource.id}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.resource}
          >
            <div className={styles.icon}>
              {resource.type === 'pdf' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              )}
              {resource.type === 'link' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              )}
              {resource.type === 'code' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              )}
              {resource.type === 'download' && (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              )}
            </div>
            <div className={styles.info}>
              <h4>{resource.title}</h4>
              <span className={styles.type}>{resource.type.toUpperCase()}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
