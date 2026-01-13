//
//  GoalCard.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useState } from 'react'
import { goalsService, type Goal } from '../../../services/goals/goalsService'
import styles from './GoalCard.module.css'

interface GoalCardProps {
  goal: Goal
  onEdit: (goal: Goal) => void
  onDelete: (id: string) => void
  onMilestoneToggle: (goalId: string, milestoneId: string, completed: boolean) => void
  onStatusUpdate: () => void
}

export function GoalCard({ goal, onEdit, onDelete, onMilestoneToggle, onStatusUpdate }: GoalCardProps) {
  const [showMilestones, setShowMilestones] = useState(false)

  const getCategoryColor = (category: Goal['category']) => {
    switch (category) {
      case 'career':
        return styles.career
      case 'skill':
        return styles.skill
      case 'project':
        return styles.project
      case 'certification':
        return styles.certification
      default:
        return styles.skill
    }
  }

  const getCategoryLabel = (category: Goal['category']) => {
    switch (category) {
      case 'career':
        return 'Carrera'
      case 'skill':
        return 'Habilidad'
      case 'project':
        return 'Proyecto'
      case 'certification':
        return 'Certificación'
      default:
        return category
    }
  }

  const getStatusColor = (status: Goal['status']) => {
    switch (status) {
      case 'active':
        return styles.statusActive
      case 'paused':
        return styles.statusPaused
      case 'completed':
        return styles.statusCompleted
      default:
        return styles.statusActive
    }
  }

  const getStatusLabel = (status: Goal['status']) => {
    switch (status) {
      case 'active':
        return 'Activo'
      case 'paused':
        return 'Pausado'
      case 'completed':
        return 'Completado'
      default:
        return status
    }
  }

  const handleTogglePause = async () => {
    try {
      const newStatus = goal.status === 'paused' ? 'active' : 'paused'
      await goalsService.updateGoal(goal.id, { status: newStatus })
      onStatusUpdate() // Call callback to refresh the list
    } catch (error) {
      console.error('Error updating goal status:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const daysUntilTarget = Math.ceil(
    (new Date(goal.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.category}>
          <span className={`${styles.categoryBadge} ${getCategoryColor(goal.category)}`}>
            {getCategoryLabel(goal.category)}
          </span>
          <span className={`${styles.statusBadge} ${getStatusColor(goal.status)}`}>
            {getStatusLabel(goal.status)}
          </span>
        </div>
        <div className={styles.actions}>
          <button
            className={styles.actionButton}
            onClick={() => onEdit(goal)}
            title="Editar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          {goal.status !== 'completed' && (
            <button
              className={`${styles.actionButton} ${goal.status === 'paused' ? styles.resumeButton : ''}`}
              onClick={handleTogglePause}
              title={goal.status === 'paused' ? 'Reanudar' : 'Pausar'}
            >
              {goal.status === 'paused' ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
          )}
          <button
            className={styles.actionButton}
            onClick={() => onDelete(goal.id)}
            title="Eliminar"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <h3 className={styles.title}>{goal.title}</h3>
      <p className={styles.description}>{goal.description}</p>

      <div className={styles.progress}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Progreso</span>
          <span className={styles.progressValue}>{goal.progress}%</span>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${goal.progress}%` }}
          ></div>
        </div>
      </div>

      <div className={styles.footer}>
        <div className={styles.dates}>
          <div className={styles.date}>
            <span className={styles.dateLabel}>Creado:</span>
            <span className={styles.dateValue}>{formatDate(goal.createdAt)}</span>
          </div>
          <div className={styles.date}>
            <span className={styles.dateLabel}>Meta:</span>
            <span className={styles.dateValue}>
              {formatDate(goal.targetDate)} ({daysUntilTarget > 0 ? `${daysUntilTarget} días` : daysUntilTarget === 0 ? 'Hoy' : 'Vencido'})
            </span>
          </div>
        </div>
      </div>

      {goal.milestones.length > 0 && (
        <div className={styles.milestones}>
          <button
            className={styles.milestonesToggle}
            onClick={() => setShowMilestones(!showMilestones)}
          >
            <span>{goal.milestones.filter(m => m.completed).length} de {goal.milestones.length} hitos completados</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              className={`${styles.chevron} ${showMilestones ? styles.chevronUp : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {showMilestones && (
            <div className={styles.milestonesList}>
              {goal.milestones.map((milestone) => (
                <label key={milestone.id} className={styles.milestone}>
                  <input
                    type="checkbox"
                    checked={milestone.completed}
                    onChange={(e) => onMilestoneToggle(goal.id, milestone.id, e.target.checked)}
                    disabled={goal.status === 'completed'}
                  />
                  <span className={styles.milestoneText}>{milestone.title}</span>
                  {milestone.completedAt && (
                    <span className={styles.milestoneDate}>
                      {formatDate(milestone.completedAt)}
                    </span>
                  )}
                </label>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
