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
}

interface ActivityListProps {
  activities: ActivityItem[]
}

export function ActivityList({ activities }: ActivityListProps) {
  const getActivityDotClass = (type: ActivityItem['type']) => {
    switch (type) {
      case 'completed':
        return styles.activityDotEmerald
      case 'created':
        return styles.activityDotBlue
      case 'evaluated':
        return styles.activityDotViolet
      default:
        return styles.activityDotEmerald
    }
  }

  return (
    <div className={styles.activityCard}>
      <div className={styles.activityHeader}>
        <h2 className={styles.activityTitle}>Actividad reciente</h2>
      </div>
      <div className={styles.activityList}>
        {activities.map((activity) => (
          <div key={activity.id} className={styles.activityItem}>
            <div className={styles.activityContent}>
              <div className={styles.activityInfo}>
                <div className={`${styles.activityDot} ${getActivityDotClass(activity.type)}`}></div>
                <div className={styles.activityText}>
                  <p className={styles.activityName}>{activity.title}</p>
                  <p className={styles.activityDetail}>{activity.detail}</p>
                </div>
              </div>
              <span className={styles.activityTime}>{activity.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
