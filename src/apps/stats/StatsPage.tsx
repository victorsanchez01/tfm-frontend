//
//  StatsPage.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@shared/ui'
import { getStoredAccessToken } from '../../services/auth/authService'
import { 
  statsService, 
  type StatsOverview as StatsOverviewType, 
  type StudyTimeData, 
  type ProgressData, 
  type ActivityData,
  type MonthlyProgressData 
} from '../../services/stats'
import { StatsOverview as StatsOverviewComponent, StudyTimeChart, ProgressChart, WeeklyActivityChart } from '../dashboard/charts'
import styles from './StatsPage.module.css'

export function StatsPage() {
  const navigate = useNavigate()
  const token = getStoredAccessToken()
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'7' | '30' | '90' | '365'>('30')
  const [statsOverview, setStatsOverview] = useState<StatsOverviewType | null>(null)
  const [studyTime, setStudyTime] = useState<StudyTimeData[]>([])
  const [progress, setProgress] = useState<ProgressData[]>([])
  const [weeklyActivity, setWeeklyActivity] = useState<ActivityData[]>([])
  const [monthlyProgress, setMonthlyProgress] = useState<MonthlyProgressData[]>([])

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    loadStats()
  }, [token, navigate, dateRange])

  const loadStats = async () => {
    try {
      const days = parseInt(dateRange)
      const [overviewData, studyTimeData, progressData, activityData, monthlyData] = await Promise.all([
        statsService.getOverview(),
        statsService.getStudyTime(days),
        statsService.getProgressByCategory(),
        statsService.getWeeklyActivity(),
        statsService.getMonthlyProgress(),
      ])
      
      setStatsOverview(overviewData)
      setStudyTime(studyTimeData)
      setProgress(progressData)
      setWeeklyActivity(activityData)
      setMonthlyProgress(monthlyData)
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = () => {
    // TODO: Implement PDF export
    console.log('Exporting to PDF...')
    alert('Función de exportación PDF próximamente')
  }

  if (!token) {
    return (
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <p style={{ color: '#64748b' }}>Redirigiendo al login...</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <p style={{ color: '#64748b' }}>Cargando estadísticas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Estadísticas Detalladas</h1>
            <p className={styles.subtitle}>Análisis completo de tu progreso de aprendizaje</p>
          </div>
          <div className={styles.headerActions}>
            <Button variant="secondary" onClick={handleExportPDF}>
              Exportar PDF
            </Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Volver
            </Button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.controls}>
          <div className={styles.dateRange}>
            <label>Período:</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value as '7' | '30' | '90' | '365')}>
              <option value="7">Últimos 7 días</option>
              <option value="30">Últimos 30 días</option>
              <option value="90">Últimos 90 días</option>
              <option value="365">Último año</option>
            </select>
          </div>
        </div>

        {statsOverview && <StatsOverviewComponent stats={statsOverview} />}

        <div className={styles.chartsGrid}>
          <div className={styles.chartCard}>
            <h3>Tiempo de estudio diario</h3>
            <StudyTimeChart data={studyTime} />
          </div>
          
          <div className={styles.chartCard}>
            <h3>Progreso por categoría</h3>
            <ProgressChart data={progress} />
          </div>
          
          <div className={styles.chartCard}>
            <h3>Actividad semanal</h3>
            <WeeklyActivityChart data={weeklyActivity} />
          </div>

          <div className={styles.chartCard}>
            <h3>Progreso mensual</h3>
            <div className={styles.monthlyStats}>
              {monthlyProgress.map((month) => (
                <div key={month.month} className={styles.monthItem}>
                  <div className={styles.monthHeader}>
                    <span className={styles.monthName}>{month.month}</span>
                    <span className={styles.monthHours}>{month.totalHours}h</span>
                  </div>
                  <div className={styles.monthProgress}>
                    <div className={styles.progressBar}>
                      <div 
                        className={styles.progressFill}
                        style={{ width: `${month.progressPercentage}%` }}
                      />
                    </div>
                    <span className={styles.progressText}>{month.progressPercentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.summary}>
          <h2>Resumen del período</h2>
          <div className={styles.summaryGrid}>
            <div className={styles.summaryCard}>
              <h4>Meta semanal</h4>
              <p className={styles.summaryValue}>
                {statsOverview ? Math.round((statsOverview.weeklyProgress / statsOverview.weeklyGoal) * 100) : 0}%
              </p>
              <p className={styles.summaryLabel}>completado</p>
            </div>
            <div className={styles.summaryCard}>
              <h4>Contenidos completados</h4>
              <p className={styles.summaryValue}>{statsOverview?.completedCourses || 0}</p>
              <p className={styles.summaryLabel}>este período</p>
            </div>
            <div className={styles.summaryCard}>
              <h4>Tiempo total</h4>
              <p className={styles.summaryValue}>
                {statsOverview ? Math.floor(statsOverview.totalStudyTime / 60) : 0}h
              </p>
              <p className={styles.summaryLabel}>de estudio</p>
            </div>
            <div className={styles.summaryCard}>
              <h4>Racha actual</h4>
              <p className={styles.summaryValue}>{statsOverview?.streakDays || 0}</p>
              <p className={styles.summaryLabel}>días seguidos</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
