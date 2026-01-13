//
//  GoalsList.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { type Goal } from '../../../services/goals/goalsService'
import { GoalCard } from './index'
import styles from './GoalsList.module.css'

interface GoalsListProps {
  goals: Goal[]
  onEdit: (goal: Goal) => void
  onDelete: (id: string) => void
  onMilestoneToggle: (goalId: string, milestoneId: string, completed: boolean) => void
  onStatusUpdate: () => void
}

export function GoalsList({ goals, onEdit, onDelete, onMilestoneToggle, onStatusUpdate }: GoalsListProps) {
  const activeGoals = goals.filter(g => g.status === 'active')
  const pausedGoals = goals.filter(g => g.status === 'paused')
  const completedGoals = goals.filter(g => g.status === 'completed')

  return (
    <div className={styles.container}>
      {activeGoals.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Activos ({activeGoals.length})</h2>
          <div className={styles.grid}>
            {activeGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={onEdit}
                onDelete={onDelete}
                onMilestoneToggle={onMilestoneToggle}
                onStatusUpdate={onStatusUpdate}
              />
            ))}
          </div>
        </section>
      )}

      {pausedGoals.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Pausados ({pausedGoals.length})</h2>
          <div className={styles.grid}>
            {pausedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={onEdit}
                onDelete={onDelete}
                onMilestoneToggle={onMilestoneToggle}
                onStatusUpdate={onStatusUpdate}
              />
            ))}
          </div>
        </section>
      )}

      {completedGoals.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Completados ({completedGoals.length})</h2>
          <div className={styles.grid}>
            {completedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onEdit={onEdit}
                onDelete={onDelete}
                onMilestoneToggle={onMilestoneToggle}
                onStatusUpdate={onStatusUpdate}
              />
            ))}
          </div>
        </section>
      )}

      {goals.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          </div>
          <h3 className={styles.emptyTitle}>No hay objetivos</h3>
          <p className={styles.emptyDescription}>
            Crea tu primer objetivo para empezar a trackear tu progreso
          </p>
        </div>
      )}
    </div>
  )
}
