//
//  GoalsPage.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@shared/ui'
import { getStoredAccessToken } from '../../services/auth/authService'
import { goalsService, type Goal } from '../../services/goals/goalsService'
import { GoalsList, GoalForm } from './components'
import styles from './GoalsPage.module.css'

export function GoalsPage() {
  const navigate = useNavigate()
  const token = getStoredAccessToken()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    loadGoals()
  }, [token, navigate])

  const loadGoals = async () => {
    try {
      const data = await goalsService.getGoals()
      setGoals(data)
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGoal = () => {
    setEditingGoal(null)
    setShowForm(true)
  }

  const handleEditGoal = (goal: Goal) => {
    setEditingGoal(goal)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingGoal(null)
  }

  const handleGoalSaved = () => {
    loadGoals()
    handleFormClose()
  }

  const handleDeleteGoal = async (id: string) => {
    try {
      await goalsService.deleteGoal(id)
      loadGoals()
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const handleMilestoneToggle = async (goalId: string, milestoneId: string, completed: boolean) => {
    try {
      await goalsService.updateMilestone(goalId, milestoneId, completed)
      loadGoals()
    } catch (error) {
      console.error('Error updating milestone:', error)
    }
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
          <p style={{ color: '#64748b' }}>Cargando objetivos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Mis Objetivos</h1>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Volver al dashboard
          </Button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.actions}>
          <Button onClick={handleCreateGoal}>
            Nuevo objetivo
          </Button>
        </div>

        <GoalsList
          goals={goals}
          onEdit={handleEditGoal}
          onDelete={handleDeleteGoal}
          onMilestoneToggle={handleMilestoneToggle}
          onStatusUpdate={loadGoals}
        />
      </main>

      {showForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <GoalForm
              goal={editingGoal}
              onClose={handleFormClose}
              onSave={handleGoalSaved}
            />
          </div>
        </div>
      )}
    </div>
  )
}
