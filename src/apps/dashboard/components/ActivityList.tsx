//
//  ActivityList.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import styles from './ActivityList.module.css'

interface ActivityItem {
  id: string
  type: 'completed' | 'created' | 'evaluated'
  title: string
  detail: string
  time: string
  icon?: string
}

interface ActivityListProps {
  activities: ActivityItem[]
}

const TYPE_CONFIG: Record<
  ActivityItem['type'],
  { emoji: string; itemClass: string; iconClass: string }
> = {
  completed: {
    emoji: '✅',
    itemClass: styles.activityItemCompleted,
    iconClass: styles.activityIconCompleted,
  },
  created: {
    emoji: '▶️',
    itemClass: styles.activityItemCreated,
    iconClass: styles.activityIconCreated,
  },
  evaluated: {
    emoji: '🎯',
    itemClass: styles.activityItemEvaluated,
    iconClass: styles.activityIconEvaluated,
  },
}

function isDetailVisible(detail: string): boolean {
  return detail.trim().length > 0 && detail.trim() !== 'Elemento'
}

export function ActivityList({ activities }: ActivityListProps) {
  return (
    <div className={styles.activityCard}>
      <div className={styles.activityHeader}>
        <h2 className={styles.activityTitle}>Actividad reciente</h2>
      </div>

      <div className={styles.activityList}>
        {activities.length === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyStateIcon}>📭</span>
            <p className={styles.emptyStateText}>No hay actividad reciente</p>
          </div>
        ) : (
          activities.map((activity) => {
            const { emoji: fallbackEmoji, itemClass, iconClass } = TYPE_CONFIG[activity.type]
            const emoji = activity.icon ?? fallbackEmoji
            const showDetail = isDetailVisible(activity.detail)

            return (
              <div
                key={activity.id}
                className={`${styles.activityItem} ${itemClass}`}
              >
                <div className={styles.activityContent}>
                  <div className={styles.activityInfo}>
                    <div className={`${styles.activityIcon} ${iconClass}`}>
                      {emoji}
                    </div>
                    <div className={styles.activityText}>
                      <p className={styles.activityName}>{activity.title}</p>
                      {showDetail && (
                        <span className={styles.activityDetail}>
                          {activity.detail}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className={styles.activityTime}>{activity.time}</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
