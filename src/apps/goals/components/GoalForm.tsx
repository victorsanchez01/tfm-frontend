//
//  GoalForm.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input, Button } from '@shared/ui'
import { goalsService, type Goal, type CreateGoalData, type UpdateGoalData } from '../../../services/goals/goalsService'
import styles from './GoalForm.module.css'

const goalSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  targetDate: z.string().min(1, 'La fecha meta es requerida'),
  category: z.enum(['career', 'skill', 'project', 'certification']),
})

type GoalFormData = z.infer<typeof goalSchema>

interface GoalFormProps {
  goal: Goal | null
  onClose: () => void
  onSave: () => void
}

export function GoalForm({ goal, onClose, onSave }: GoalFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: goal?.title || '',
      description: goal?.description || '',
      targetDate: goal?.targetDate || '',
      category: goal?.category || 'skill',
    },
  })

  useEffect(() => {
    if (goal) {
      reset({
        title: goal.title,
        description: goal.description,
        targetDate: goal.targetDate,
        category: goal.category,
      })
    }
  }, [goal, reset])

  const onSubmit = async (data: GoalFormData) => {
    try {
      setLoading(true)
      setError(undefined)

      if (goal) {
        // Update existing goal
        await goalsService.updateGoal(goal.id, data as UpdateGoalData)
      } else {
        // Create new goal
        await goalsService.createGoal(data as CreateGoalData)
      }

      onSave()
    } catch {
      setError('Ocurrió un error al guardar el objetivo')
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {goal ? 'Editar objetivo' : 'Nuevo objetivo'}
        </h2>
        <button type="button" className={styles.closeButton} onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          <span>{error}</span>
        </div>
      )}

      <div className={styles.fields}>
        <Input
          label="Título"
          placeholder="Ej: Aprender TypeScript"
          {...register('title')}
          error={errors.title?.message}
          required
        />

        <div className={styles.field}>
          <label className={styles.label}>Descripción</label>
          <textarea
            className={styles.textarea}
            placeholder="Describe tu objetivo en detalle..."
            {...register('description')}
            rows={4}
          />
          {errors.description && (
            <span className={styles.fieldError}>{errors.description.message}</span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Categoría</label>
          <select className={styles.select} {...register('category')}>
            <option value="skill">Habilidad</option>
            <option value="career">Carrera</option>
            <option value="project">Proyecto</option>
            <option value="certification">Certificación</option>
          </select>
          {errors.category && (
            <span className={styles.fieldError}>{errors.category.message}</span>
          )}
        </div>

        <Input
          label="Fecha meta"
          type="date"
          min={today}
          {...register('targetDate')}
          error={errors.targetDate?.message}
          required
        />
      </div>

      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button type="submit" loading={loading} disabled={loading}>
          {loading ? 'Guardando...' : goal ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  )
}
