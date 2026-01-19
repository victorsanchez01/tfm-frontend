//
//  DashboardPage.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const [statsOverview, setStatsOverview] = useState<StatsOverviewType | null>(null)
  const [studyTime, setStudyTime] = useState<StudyTimeData[]>([])
  const [progress, setProgress] = useState<ProgressData[]>([])
  const [weeklyActivity, setWeeklyActivity] = useState<ActivityData[]>([])
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [showMenu, setShowMenu] = useState(false)

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
      }
    }

    if (token) {
      loadDashboardData()
    }
  }, [token])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMenu && !(event.target as Element).closest('.menuContainer')) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showMenu])

  const handleLogout = () => {
    clearTokens()
    navigate('/login')
  }

  const handleGoalsClick = () => {
    navigate('/goals')
  }

  const handleStatsClick = () => {
    navigate('/stats')
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

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.userInfo}>
            <div className={styles.avatar}>
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className={styles.userDetails}>
              <h2 className={styles.userName}>Bienvenido de nuevo</h2>
              <p className={styles.userEmail}>usuario@ejemplo.com</p>
            </div>
          </div>
          
          <div className={styles.menuContainer}>
            <button 
              className={styles.menuButton}
              onMouseDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setShowMenu(!showMenu)
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {showMenu && (
              <div className={styles.dropdownMenu}>
                <button 
                  className={styles.menuItem}
                  onMouseDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowMenu(false)
                    navigate('/profile')
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Perfil
                </button>
                <button 
                  className={styles.menuItem}
                  onClick={() => {
                    handleLogout()
                    setShowMenu(false)
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.headerTitle}>Dashboard</h1>
            <p className={styles.headerSubtitle}>
              {stats?.completedLessons || 0} de {stats?.totalLessons || 0} lecciones completadas
            </p>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {statsOverview && (
          <StatsOverview stats={statsOverview} />
        )}
        
        <div className={styles.cardGrid}>
          <div className={styles.featuredCard}>
            <DashboardCard
              icon={
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              }
              iconColor="blue"
              title="Contenidos"
              description={`${stats?.totalCourses || 0} cursos disponibles para aprender`}
              buttonText="Explorar contenidos"
              onButtonClick={handleContentClick}
            />
          </div>
          
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
            iconColor="violet"
            title="Estadísticas"
            description="Análisis detallado de tu progreso"
            buttonText="Ver estadísticas"
            onButtonClick={handleStatsClick}
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
