//
//  StatsOverview.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { type StatsOverview } from '../../../services/stats/statsService'
import styles from './StatsOverview.module.css'

interface StatsOverviewProps {
  stats: StatsOverview
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const weeklyPercentage = Math.round((stats.weeklyProgress / stats.weeklyGoal) * 100)

  return (
    <div className={styles.grid}>
      <div className={styles.statCard}>
        <div className={styles.icon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className={styles.content}>
          <p className={styles.label}>Tiempo total</p>
          <p className={styles.value}>{formatTime(stats.totalStudyTime)}</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.icon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
        </div>
        <div className={styles.content}>
          <p className={styles.label}>Racha actual</p>
          <p className={styles.value}>{stats.streakDays} días</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.icon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
          </svg>
        </div>
        <div className={styles.content}>
          <p className={styles.label}>Cursos completados</p>
          <p className={styles.value}>{stats.completedCourses}</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.icon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div className={styles.content}>
          <p className={styles.label}>En progreso</p>
          <p className={styles.value}>{stats.inProgressCourses}</p>
        </div>
      </div>

      <div className={`${styles.statCard} ${styles.wide}`}>
        <div className={styles.icon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div className={styles.content}>
          <p className={styles.label}>Meta semanal</p>
          <p className={styles.value}>
            {formatTime(stats.weeklyProgress)} / {formatTime(stats.weeklyGoal)}
          </p>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min(weeklyPercentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
