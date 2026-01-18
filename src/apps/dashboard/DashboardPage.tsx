//
//  DashboardPage.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@shared/ui'
import { getStoredAccessToken, clearTokens } from '../../services/auth/authService'
import { dashboardService, type DashboardStats, type ActivityItem } from '../../services/dashboard/dashboardService'
import { statsService, type StatsOverview as StatsOverviewType, type StudyTimeData, type ProgressData, type ActivityData } from '../../services/stats'
import { DashboardCard } from './components/DashboardCard'
import { ActivityList } from './components/ActivityList'
import { StatsOverview, StudyTimeChart, ProgressChart, WeeklyActivityChart } from './charts'
import styles from './DashboardPage.module.css'

export function DashboardPage() {
  const navigate = useNavigate()
  const token = getStoredAccessToken()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statsOverview, setStatsOverview] = useState<StatsOverviewType | null>(null)
  const [studyTime, setStudyTime] = useState<StudyTimeData[]>([])
  const [progress, setProgress] = useState<ProgressData[]>([])
  const [weeklyActivity, setWeeklyActivity] = useState<ActivityData[]>([])

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token, navigate])

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [statsData, activitiesData, overviewData, studyTimeData, progressData, activityData] = await Promise.all([
          dashboardService.getDashboardStats(),
          dashboardService.getRecentActivities(),
          statsService.getOverview(),
          statsService.getStudyTime(30),
          statsService.getProgressByCategory(),
          statsService.getWeeklyActivity(),
        ])
        
        setStats(statsData)
        setActivities(activitiesData)
        setStatsOverview(overviewData)
        setStudyTime(studyTimeData)
        setProgress(progressData)
        setWeeklyActivity(activityData)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    if (token) {
      loadDashboardData()
    }
  }, [token])

  const handleLogout = () => {
    clearTokens()
    navigate('/login')
  }

  const handleProfileClick = () => {
    navigate('/profile')
  }

  const handleGoalsClick = () => {
    navigate('/goals')
  }

  const handleContentClick = () => {
    navigate('/contents')
  }

  if (!token) {
    return (
      <div className={styles.dashboard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <p style={{ color: '#64748b' }}>Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.dashboard}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <p style={{ color: '#64748b' }}>Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.headerTitle}>Dashboard</h1>
            <p className={styles.headerSubtitle}>
              {stats?.completedLessons || 0} de {stats?.totalLessons || 0} lecciones completadas
            </p>
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </header>

      <main className={styles.main}>
        {statsOverview && (
          <StatsOverview stats={statsOverview} />
        )}
        
        <div className={styles.cardGrid}>
          <DashboardCard
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            }
            iconColor="blue"
            title="Perfil"
            description="Configura tu información personal"
            buttonText="Editar perfil"
            onButtonClick={handleProfileClick}
          />
          <DashboardCard
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            iconColor="emerald"
            title="Objetivos"
            description={`${stats?.activeGoals || 0} objetivos en progreso`}
            buttonText="Ver objetivos"
            onButtonClick={handleGoalsClick}
          />
          <DashboardCard
            icon={
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
            iconColor="violet"
            title="Contenidos"
            description={`${stats?.totalCourses || 0} cursos disponibles`}
            buttonText="Explorar"
            onButtonClick={handleContentClick}
          />
        </div>

        <div className={styles.chartsGrid}>
          <StudyTimeChart data={studyTime} />
          <ProgressChart data={progress} />
          <WeeklyActivityChart data={weeklyActivity} />
        </div>

        <ActivityList activities={activities} />
      </main>
    </div>
  )
}
