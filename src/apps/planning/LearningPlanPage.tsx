//
//  LearningPlanPage.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Apr 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@shared/ui'
import { getStoredAccessToken } from '../../services/auth/authService'
import {
  getActivePlan,
  getPlanModules,
  getPlanActivities,
  updateActivity,
  replan,
  type LearningPlan,
  type PlanModule,
  type PlanActivity,
} from '../../services/planning/planningService'
import { GeneratePlanModal } from './GeneratePlanModal'
import { httpClient } from '../../services/api/httpClient'
import styles from './LearningPlanPage.module.css'

export function LearningPlanPage() {
  const navigate = useNavigate()
  const token = getStoredAccessToken()

  const [plan, setPlan] = useState<LearningPlan | null>(null)
  const [modules, setModules] = useState<PlanModule[]>([])
  const [activities, setActivities] = useState<Record<string, PlanActivity[]>>({})
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [updatingActivity, setUpdatingActivity] = useState<string | null>(null)
  const [showGenerateModal, setShowGenerateModal] = useState(false)
  const [replanning, setReplanning] = useState(false)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    loadPlan()
  }, [token, navigate])

  const loadPlan = useCallback(async () => {
    setLoading(true)
    try {
      const activePlan = await getActivePlan()
      setPlan(activePlan)
      if (activePlan) {
        const mods = await getPlanModules(activePlan.id)
        setModules(mods)
        // Expandir el primer módulo por defecto
        if (mods.length > 0) {
          setExpandedModules(new Set([mods[0].id]))
          await loadActivitiesForModule(activePlan.id, mods[0].id)
        }
      }
    } catch (err) {
      console.error('Error loading plan:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadActivitiesForModule = async (planId: string, moduleId: string) => {
    if (activities[moduleId]) return // ya cargadas
    try {
      const acts = await getPlanActivities(planId, moduleId)
      setActivities(prev => ({ ...prev, [moduleId]: acts }))
    } catch (err) {
      console.error('Error loading activities:', err)
      setActivities(prev => ({ ...prev, [moduleId]: [] }))
    }
  }

  const toggleModule = async (moduleId: string) => {
    const next = new Set(expandedModules)
    if (next.has(moduleId)) {
      next.delete(moduleId)
    } else {
      next.add(moduleId)
      if (plan) await loadActivitiesForModule(plan.id, moduleId)
    }
    setExpandedModules(next)
  }

  const handleToggleActivity = async (
    moduleId: string,
    activity: PlanActivity
  ) => {
    if (!plan || updatingActivity) return

    const newStatus = activity.status === 'completed' ? 'pending' : 'completed'
    setUpdatingActivity(activity.id)

    // Actualización optimista
    setActivities(prev => ({
      ...prev,
      [moduleId]: prev[moduleId].map(a =>
        a.id === activity.id ? { ...a, status: newStatus } : a
      ),
    }))

    try {
      await updateActivity(plan.id, activity.id, { status: newStatus })

      // Tracking event (fire-and-forget)
      if (newStatus === 'completed') {
        const userId = localStorage.getItem('user_id') ?? ''
        httpClient
          .post('/tracking/events', {
            userId,
            eventType: 'ACTIVITY_COMPLETE',
            entityType: 'activity',
            entityId: activity.id,
            occurredAt: new Date().toISOString(),
            payload: JSON.stringify({ planId: plan.id, moduleId, activityId: activity.id }),
          })
          .catch(() => {})
      }

      // Refrescar módulos para ver si cambió el estado
      const mods = await getPlanModules(plan.id)
      setModules(mods)
    } catch (err) {
      // Revertir en caso de error
      setActivities(prev => ({
        ...prev,
        [moduleId]: prev[moduleId].map(a =>
          a.id === activity.id ? { ...a, status: activity.status } : a
        ),
      }))
      console.error('Error updating activity:', err)
    } finally {
      setUpdatingActivity(null)
    }
  }

  const handleReplan = async () => {
    if (!plan || replanning) return
    if (!window.confirm('¿Quieres que la IA reajuste tu plan de aprendizaje según tu progreso actual?')) return

    setReplanning(true)
    try {
      await replan(plan.id)
      await loadPlan()
    } catch (err) {
      console.error('Error replanning:', err)
      alert('No se pudo replanificar. Inténtalo de nuevo.')
    } finally {
      setReplanning(false)
    }
  }

  const handlePlanGenerated = async (newPlan: LearningPlan) => {
    setShowGenerateModal(false)
    setPlan(newPlan)

    // Tracking event (fire-and-forget)
    const userId = localStorage.getItem('user_id') ?? ''
    httpClient
      .post('/tracking/events', {
        userId,
        eventType: 'PLAN_GENERATED',
        entityType: 'plan',
        entityId: newPlan.id,
        occurredAt: new Date().toISOString(),
        payload: JSON.stringify({ planId: newPlan.id, goalId: newPlan.goalId }),
      })
      .catch(() => {})

    // Cargar módulos del plan nuevo
    try {
      const mods = await getPlanModules(newPlan.id)
      setModules(mods)
      if (mods.length > 0) {
        setExpandedModules(new Set([mods[0].id]))
        await loadActivitiesForModule(newPlan.id, mods[0].id)
      }
    } catch (err) {
      console.error('Error loading modules:', err)
    }
  }

  const completedModules = modules.filter(m => m.status === 'completed').length
  const progressPercent = modules.length > 0
    ? Math.round((completedModules / modules.length) * 100)
    : 0

  const getStatusClass = (status: string) => {
    if (status === 'completed') return styles.badgeCompleted
    if (status === 'in_progress') return styles.badgeInProgress
    return styles.badgePending
  }

  const getStatusIcon = (status: string) => {
    if (status === 'completed') return '✓'
    if (status === 'in_progress') return '▶'
    return '○'
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando plan de aprendizaje...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Mi Plan de Aprendizaje</h1>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              ← Dashboard
            </Button>
            {plan && (
              <Button
                variant="secondary"
                onClick={handleReplan}
                disabled={replanning}
              >
                {replanning ? 'Replanificando...' : '🔄 Replanificar'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className={styles.main}>
        {!plan ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎯</div>
            <h2 className={styles.emptyTitle}>Sin plan de aprendizaje activo</h2>
            <p className={styles.emptyText}>
              Genera un plan personalizado con IA basado en tus objetivos.
            </p>
            <Button variant="primary" onClick={() => setShowGenerateModal(true)}>
              Generar mi plan con IA
            </Button>
          </div>
        ) : (
          <>
            {/* Progreso general */}
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span className={styles.progressLabel}>
                  Progreso del plan · {completedModules}/{modules.length} módulos completados
                </span>
                <span className={styles.progressPercent}>{progressPercent}%</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Lista de módulos */}
            <div className={styles.modulesSection}>
              {modules.length === 0 && (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem' }}>
                  El plan no tiene módulos todavía. Prueba a replanificar.
                </p>
              )}
              {modules.map((mod, idx) => {
                const isOpen = expandedModules.has(mod.id)
                const modActivities = activities[mod.id] ?? []

                return (
                  <div key={mod.id} className={styles.moduleCard}>
                    <div
                      className={styles.moduleHeader}
                      onClick={() => toggleModule(mod.id)}
                    >
                      <div className={`${styles.moduleBadge} ${getStatusClass(mod.status)}`}>
                        {getStatusIcon(mod.status)}
                      </div>
                      <h3 className={styles.moduleTitle}>
                        {idx + 1}. {mod.title}
                      </h3>
                      {mod.estimatedHours && (
                        <span className={styles.moduleMeta}>
                          ~{mod.estimatedHours}h
                        </span>
                      )}
                      <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
                        ▼
                      </span>
                    </div>

                    {isOpen && (
                      <div className={styles.activitiesList}>
                        {modActivities.length === 0 && !activities[mod.id] && (
                          <p className={styles.loadingActivities}>Cargando actividades...</p>
                        )}
                        {modActivities.length === 0 && activities[mod.id] !== undefined && (
                          <p className={styles.loadingActivities}>Sin actividades en este módulo.</p>
                        )}
                        {modActivities.map(act => (
                          <div key={act.id} className={styles.activityItem}>
                            <input
                              type="checkbox"
                              className={styles.checkbox}
                              checked={act.status === 'completed'}
                              disabled={updatingActivity === act.id}
                              onChange={() => handleToggleActivity(mod.id, act)}
                            />
                            <span
                              className={`${styles.activityText} ${
                                act.status === 'completed' ? styles.activityTextDone : ''
                              }`}
                            >
                              {act.contentRef}
                            </span>
                            <span className={styles.activityType}>
                              {act.activityType}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Botón de replan al final */}
            {modules.length > 0 && (
              <div className={styles.replanSection}>
                <Button
                  variant="secondary"
                  onClick={handleReplan}
                  disabled={replanning}
                >
                  {replanning ? 'Replanificando...' : 'Reajustar plan con IA'}
                </Button>
                <p className={styles.replanNote}>
                  La IA ajustará el plan según tu progreso actual
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {showGenerateModal && (
        <GeneratePlanModal
          onClose={() => setShowGenerateModal(false)}
          onGenerated={handlePlanGenerated}
        />
      )}
    </div>
  )
}
