//
//  GeneratePlanModal.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Apr 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useEffect, useState } from 'react'
import { Button } from '@shared/ui'
import { goalsService, type Goal } from '../../services/goals/goalsService'
import { createPlan, type LearningPlan } from '../../services/planning/planningService'
import styles from './LearningPlanPage.module.css'

interface GeneratePlanModalProps {
  onClose: () => void
  onGenerated: (plan: LearningPlan) => void
}

export function GeneratePlanModal({ onClose, onGenerated }: GeneratePlanModalProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [loadingGoals, setLoadingGoals] = useState(true)

  useEffect(() => {
    const loadGoals = async () => {
      try {
        const data = await goalsService.getGoals()
        const active = data.filter(g => g.status === 'active')
        setGoals(active)
        if (active.length > 0) setSelectedGoalId(active[0].id)
      } catch (err) {
        console.error('Error loading goals:', err)
      } finally {
        setLoadingGoals(false)
      }
    }
    loadGoals()
  }, [])

  const handleGenerate = async () => {
    if (!selectedGoalId) {
      setError('Selecciona un objetivo')
      return
    }

    const userId = localStorage.getItem('user_id') ?? ''
    if (!userId) {
      setError('No se encontró tu sesión. Vuelve a iniciar sesión.')
      return
    }

    setGenerating(true)
    setError('')

    try {
      // modules: [] → el backend invoca AI automáticamente
      const newPlan = await createPlan({ userId, goalId: selectedGoalId, modules: [] })
      onGenerated(newPlan)
    } catch (err) {
      console.error('Error generating plan:', err)
      setError('No se pudo generar el plan. Verifica que el backend esté activo e inténtalo de nuevo.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>Generar plan de aprendizaje</h2>
        <p className={styles.modalSubtitle}>
          La IA creará un plan personalizado basado en tu objetivo y el catálogo de contenidos.
        </p>

        {loadingGoals ? (
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Cargando objetivos...</p>
        ) : goals.length === 0 ? (
          <div>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
              Necesitas al menos un objetivo activo para generar un plan.
            </p>
            <Button variant="secondary" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        ) : (
          <>
            <div className={styles.formGroup}>
              <label className={styles.label} htmlFor="goal-select">
                Objetivo de aprendizaje
              </label>
              <select
                id="goal-select"
                className={styles.select}
                value={selectedGoalId}
                onChange={e => setSelectedGoalId(e.target.value)}
                disabled={generating}
              >
                {goals.map(g => (
                  <option key={g.id} value={g.id}>
                    {g.title}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>
                {error}
              </p>
            )}

            {generating && (
              <p className={styles.generatingNote}>
                ⏳ Generando plan con IA... Esto puede tardar hasta 10 segundos.
              </p>
            )}

            <div className={styles.modalActions}>
              <Button variant="secondary" onClick={onClose} disabled={generating}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleGenerate}
                disabled={generating || !selectedGoalId}
              >
                {generating ? 'Generando...' : 'Generar plan'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
