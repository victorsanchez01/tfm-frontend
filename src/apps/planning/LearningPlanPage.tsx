//
//  LearningPlanPage.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Apr 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
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

// ── Helpers ───────────────────────────────────────────────────────────────────

const ACTIVITY_ICONS: Record<string, string> = {
  lesson:    '📝',
  article:   '📄',
  video:     '🎬',
  exercise:  '🧩',
  quiz:      '🎯',
  practice:  '💻',
  reading:   '📖',
  project:   '🏗️',
}

function getActivityIcon(type: string): string {
  return ACTIVITY_ICONS[type?.toLowerCase()] ?? '📌'
}

function formatContentRef(ref: string, contentMap: Map<string, string>): string {
  if (!ref) return 'Actividad'
  // UUID en el catálogo de contenidos
  if (contentMap.has(ref)) return contentMap.get(ref)!
  // Prefijos semánticos
  if (ref.startsWith('lesson:'))  return ref.replace('lesson:', 'Lección: ')
  if (ref.startsWith('manual:'))  return 'Actividad'
  if (ref.startsWith('sys:'))     return 'Actividad'
  // UUID desconocido — abreviar
  if (ref.length === 36 && ref.includes('-')) return 'Actividad'
  return ref
}

// ── Component ─────────────────────────────────────────────────────────────────

export function LearningPlanPage() {
  const navigate  = useNavigate()
  const token     = getStoredAccessToken()

  const [plan,            setPlan]            = useState<LearningPlan | null>(null)
  const [modules,         setModules]         = useState<PlanModule[]>([])
  const [activities,      setActivities]      = useState<Record<string, PlanActivity[]>>({})
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set())
  const [contentMap,      setContentMap]      = useState<Map<string, string>>(new Map())
  const [loading,         setLoading]         = useState(true)
  const [updatingActivity,setUpdatingActivity]= useState<string | null>(null)
  const [showModal,       setShowModal]       = useState(false)
  const [replanning,      setReplanning]      = useState(false)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    loadPlan()
  }, [token, navigate])

  const loadPlan = useCallback(async () => {
    setLoading(true)
    try {
      // Cargar plan y catálogo de contenidos en paralelo para resolver UUIDs
      const [activePlan, contentItems] = await Promise.all([
        getActivePlan(),
        httpClient
          .get<{ id: string; title: string }[]>('/content/content-items?page=0&size=100')
          .catch(() => [] as { id: string; title: string }[]),
      ])

      // Construir mapa contentId → title
      const map = new Map<string, string>()
      for (const item of Array.isArray(contentItems) ? contentItems : []) {
        map.set(item.id, item.title)
      }
      setContentMap(map)

      setPlan(activePlan)
      if (activePlan) {
        const mods = await getPlanModules(activePlan.id)
        setModules(mods)
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
    if (activities[moduleId]) return
    try {
      const acts = await getPlanActivities(planId, moduleId)
      setActivities(prev => ({ ...prev, [moduleId]: acts }))
    } catch {
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

  const handleToggleActivity = async (moduleId: string, activity: PlanActivity) => {
    if (!plan || updatingActivity) return

    const newStatus = activity.status === 'completed' ? 'pending' : 'completed'
    setUpdatingActivity(activity.id)

    setActivities(prev => ({
      ...prev,
      [moduleId]: prev[moduleId].map(a =>
        a.id === activity.id ? { ...a, status: newStatus } : a
      ),
    }))

    try {
      await updateActivity(plan.id, activity.id, { status: newStatus })

      if (newStatus === 'completed') {
        const userId = localStorage.getItem('user_id') ?? ''
        httpClient
          .post('/tracking/events', {
            userId,
            eventType: 'ACTIVITY_COMPLETE',
            entityType: 'activity',
            entityId: activity.id,
            occurredAt: new Date().toISOString(),
            // payload con los campos requeridos por EventPayloadValidator
            payload: JSON.stringify({
              activityId: activity.id,
              planId: plan.id,
              completedAt: new Date().toISOString(),
              timeSpentMs: 0,
              title: formatContentRef(activity.contentRef, contentMap), // nombre para el dashboard
            }),
          })
          .catch(() => {})
      }

      const mods = await getPlanModules(plan.id)
      setModules(mods)
    } catch {
      setActivities(prev => ({
        ...prev,
        [moduleId]: prev[moduleId].map(a =>
          a.id === activity.id ? { ...a, status: activity.status } : a
        ),
      }))
    } finally {
      setUpdatingActivity(null)
    }
  }

  const handleReplan = async () => {
    if (!plan || replanning) return
    if (!window.confirm('¿Quieres que la IA reajuste tu plan según tu progreso actual?')) return
    setReplanning(true)
    try {
      await replan(plan.id)
      await loadPlan()
    } catch {
      alert('No se pudo replanificar. Inténtalo de nuevo.')
    } finally {
      setReplanning(false)
    }
  }

  const handlePlanGenerated = async (newPlan: LearningPlan) => {
    setShowModal(false)
    setPlan(newPlan)

    const userId = localStorage.getItem('user_id') ?? ''
    httpClient
      .post('/tracking/events', {
        userId,
        eventType: 'PLAN_GENERATED',
        entityType: 'plan',
        entityId: newPlan.id,
        occurredAt: new Date().toISOString(),
        // payload con los campos requeridos por EventPayloadValidator (planId + userId)
        payload: JSON.stringify({
          planId: newPlan.id,
          userId,
          title: newPlan.title ?? newPlan.goalId ?? 'Plan de aprendizaje',
        }),
      })
      .catch(() => {})

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

  // ── Derived state ───────────────────────────────────────────────────────────
  const completedModules = modules.filter(m => m.status === 'completed').length
  const progressPercent  = modules.length > 0
    ? Math.round((completedModules / modules.length) * 100) : 0

  const getBadgeClass = (status: string) => {
    if (status === 'completed')   return styles.badgeCompleted
    if (status === 'in_progress') return styles.badgeInProgress
    return styles.badgePending
  }

  const getBadgeContent = (status: string, idx: number) => {
    if (status === 'completed')   return '✓'
    if (status === 'in_progress') return '▶'
    return String(idx + 1)
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando plan de aprendizaje...</div>
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>

      {/* ── Header ── */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Mi Plan de Aprendizaje</h1>
          <div className={styles.headerActions}>
            <button className={styles.btnGlass} onClick={() => navigate('/dashboard')}>
              ← Dashboard
            </button>
            {plan && (
              <button
                className={styles.btnGlass}
                onClick={handleReplan}
                disabled={replanning}
              >
                {replanning ? '⏳ Replanificando...' : '🔄 Replanificar'}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className={styles.main}>

        {/* ── Empty state ── */}
        {!plan ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>🎯</span>
            <h2 className={styles.emptyTitle}>Sin plan de aprendizaje</h2>
            <p className={styles.emptyText}>
              Genera un plan personalizado con IA. Primero haremos un test diagnóstico
              para adaptar el plan a tu nivel actual.
            </p>
            <button className={styles.btnPrimary} onClick={() => setShowModal(true)}>
              ✨ Generar mi plan con IA
            </button>
          </div>
        ) : (
          <>
            {/* ── Progress ── */}
            <div className={styles.progressSection}>
              <div className={styles.progressHeader}>
                <span className={styles.progressLabel}>
                  {completedModules}/{modules.length} módulos completados
                </span>
                <span className={styles.progressPercent}>{progressPercent}%</span>
              </div>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            {/* ── Modules ── */}
            <div className={styles.modulesSection}>
              {modules.length === 0 && (
                <p style={{ color: '#64748b', textAlign: 'center', padding: '2rem 0' }}>
                  El plan no tiene módulos. Prueba a replanificar.
                </p>
              )}

              {modules.map((mod, idx) => {
                const isOpen       = expandedModules.has(mod.id)
                const modActivities = activities[mod.id] ?? []
                const doneCount    = modActivities.filter(a => a.status === 'completed').length

                return (
                  <div
                    key={mod.id}
                    className={styles.moduleCard}
                    data-status={mod.status}
                  >
                    {/* Module header */}
                    <div className={styles.moduleHeader} onClick={() => toggleModule(mod.id)}>
                      <div className={`${styles.moduleBadge} ${getBadgeClass(mod.status)}`}>
                        {getBadgeContent(mod.status, idx)}
                      </div>

                      <h3 className={styles.moduleTitle}>{mod.title}</h3>

                      {modActivities.length > 0 && (
                        <span className={styles.moduleProgress}>
                          {doneCount}/{modActivities.length}
                        </span>
                      )}

                      {mod.estimatedHours != null && (
                        <span className={styles.moduleMeta}>~{mod.estimatedHours}h</span>
                      )}

                      <span className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}>
                        ▼
                      </span>
                    </div>

                    {/* Activities */}
                    {isOpen && (
                      <div className={styles.activitiesList}>
                        {!activities[mod.id] && (
                          <p className={styles.loadingActivities}>Cargando actividades…</p>
                        )}
                        {activities[mod.id] && modActivities.length === 0 && (
                          <p className={styles.loadingActivities}>Sin actividades en este módulo.</p>
                        )}

                        {modActivities.map(act => {
                          const isDone = act.status === 'completed'
                          const label  = formatContentRef(act.contentRef, contentMap)
                          const icon   = getActivityIcon(act.activityType)

                          return (
                            <div key={act.id} className={styles.activityItem}>
                              <input
                                type="checkbox"
                                className={styles.checkbox}
                                checked={isDone}
                                disabled={updatingActivity === act.id}
                                onChange={() => handleToggleActivity(mod.id, act)}
                              />
                              <span className={styles.activityIcon}>{icon}</span>
                              <span className={`${styles.activityText} ${isDone ? styles.activityTextDone : ''}`}>
                                {label}
                              </span>
                              <span className={styles.activityType}>
                                {act.activityType}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* ── Replan button ── */}
            {modules.length > 0 && (
              <div className={styles.replanSection}>
                <button
                  className={styles.btnGlass}
                  style={{ background: '#fff', color: '#475569', border: '1px solid #e2e8f0' }}
                  onClick={handleReplan}
                  disabled={replanning}
                >
                  {replanning ? '⏳ Replanificando…' : '🔄 Reajustar plan con IA'}
                </button>
                <p className={styles.replanNote}>La IA ajustará el plan según tu progreso actual</p>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <GeneratePlanModal
          onClose={() => setShowModal(false)}
          onGenerated={handlePlanGenerated}
        />
      )}
    </div>
  )
}
