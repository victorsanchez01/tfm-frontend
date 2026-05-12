//
//  GeneratePlanModal.tsx
//  TFM Frontend — Wizard de 3 pasos: Objetivo → Diagnóstico → Generar Plan
//
//  Created by Victor Sanchez on Apr 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { Fragment, useEffect, useState } from 'react'
import { Button } from '@shared/ui'
import { goalsService, type Goal } from '../../services/goals/goalsService'
import {
  createPlan,
  generateDiagnostic,
  type LearningPlan,
  type DiagnosticQuestion,
} from '../../services/planning/planningService'
import styles from './LearningPlanPage.module.css'

type Step = 'goal' | 'diagnostic' | 'result' | 'generating'
type Level = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

interface GeneratePlanModalProps {
  onClose: () => void
  onGenerated: (plan: LearningPlan, goalTitle?: string) => void
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function scoreToLevel(correct: number, total: number): Level {
  const pct = total > 0 ? correct / total : 0
  if (pct >= 0.67) return 'ADVANCED'
  if (pct >= 0.34) return 'INTERMEDIATE'
  return 'BEGINNER'
}

const LEVEL_META: Record<Level, { emoji: string; label: string; subtitle: string; badgeClass: string }> = {
  BEGINNER:     { emoji: '🌱', label: 'Principiante',  subtitle: 'El plan comenzará desde los fundamentos.',                 badgeClass: styles.levelBeginner },
  INTERMEDIATE: { emoji: '🚀', label: 'Intermedio',    subtitle: 'El plan se adaptará a tu nivel actual.',                   badgeClass: styles.levelIntermediate },
  ADVANCED:     { emoji: '⚡', label: 'Avanzado',      subtitle: 'El plan profundizará en conceptos avanzados.',             badgeClass: styles.levelAdvanced },
}

// ── Component ─────────────────────────────────────────────────────────────────

export function GeneratePlanModal({ onClose, onGenerated }: GeneratePlanModalProps) {
  // Step state
  const [step, setStep] = useState<Step>('goal')

  // Step 1 — Goal selection
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState('')
  const [loadingGoals, setLoadingGoals] = useState(true)

  // Step 2 — Diagnostic quiz
  const [questions, setQuestions] = useState<DiagnosticQuestion[]>([])
  const [currentQ, setCurrentQ] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [answers, setAnswers] = useState<{ optionId: string; isCorrect: boolean }[]>([])
  const [loadingDiagnostic, setLoadingDiagnostic] = useState(false)

  // Step 3 — Result & generate
  const [detectedLevel, setDetectedLevel] = useState<Level>('BEGINNER')
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')

  // Load goals on mount
  useEffect(() => {
    goalsService.getGoals()
      .then(data => {
        const active = data.filter(g => g.status === 'active')
        setGoals(active)
        if (active.length > 0) setSelectedGoalId(active[0].id)
      })
      .catch(() => {})
      .finally(() => setLoadingGoals(false))
  }, [])

  // ── Step 1: confirm goal, fetch diagnostic ────────────────────────────────
  const handleGoalNext = async () => {
    if (!selectedGoalId) return
    const goal = goals.find(g => g.id === selectedGoalId)

    if (!goal?.domainId) {
      // Sin domainId → saltar diagnóstico y generar directamente
      await handleGenerate('BEGINNER')
      return
    }

    setLoadingDiagnostic(true)
    setStep('diagnostic')
    try {
      const qs = await generateDiagnostic(goal.domainId, 'BEGINNER', 5)
      if (qs.length === 0) {
        // No hay preguntas → generar directamente
        await handleGenerate('BEGINNER')
        return
      }
      setQuestions(qs)
      setCurrentQ(0)
      setAnswers([])
      setSelectedOption(null)
      setAnswered(false)
    } catch {
      // Si falla el diagnóstico, continuar sin él
      await handleGenerate('BEGINNER')
    } finally {
      setLoadingDiagnostic(false)
    }
  }

  // ── Step 2: answer question ───────────────────────────────────────────────
  const handleSelectOption = (optionId: string) => {
    if (answered) return
    setSelectedOption(optionId)
  }

  const handleConfirmAnswer = () => {
    if (!selectedOption) return
    const q = questions[currentQ]
    const isCorrect = q.options.find(o => (o.label ?? o.optionId) === selectedOption)?.isCorrect ?? false
    setAnswered(true)
    const newAnswers = [...answers, { optionId: selectedOption, isCorrect }]

    setTimeout(() => {
      if (currentQ + 1 < questions.length) {
        setCurrentQ(currentQ + 1)
        setSelectedOption(null)
        setAnswered(false)
        setAnswers(newAnswers)
      } else {
        // Fin del diagnóstico — calcular nivel
        const correct = newAnswers.filter(a => a.isCorrect).length
        const level = scoreToLevel(correct, newAnswers.length)
        setDetectedLevel(level)
        setAnswers(newAnswers)
        setStep('result')
      }
    }, 700)
  }

  // ── Step 3: generate plan with detected level ─────────────────────────────
  const handleGenerate = async (level?: Level) => {
    const userId = localStorage.getItem('user_id') ?? ''
    if (!userId) { setError('Sesión no encontrada. Vuelve a iniciar sesión.'); return }

    const finalLevel = level ?? detectedLevel
    const selectedGoal = goals.find(g => g.id === selectedGoalId)

    setStep('generating')
    setGenerating(true)
    setError('')

    try {
      const newPlan = await createPlan({
        userId,
        goalId: selectedGoalId,
        domainId: selectedGoal?.domainId,
        planName: selectedGoal?.title,
        currentLevel: finalLevel,
        modules: [],
      })
      onGenerated(newPlan, selectedGoal?.title)
    } catch {
      setError('No se pudo generar el plan. Verifica que el backend esté activo e inténtalo de nuevo.')
      setStep('result')
      setGenerating(false)
    }
  }

  // ── Step indicator ────────────────────────────────────────────────────────
  const stepIndex = { goal: 0, diagnostic: 1, result: 2, generating: 2 }[step]

  const StepIndicator = () => (
    <div className={styles.steps}>
      {['Objetivo', 'Diagnóstico', 'Generar'].map((label, i) => (
        <Fragment key={label}>
          <div
            className={`${styles.step} ${i === stepIndex ? styles.stepActive : i < stepIndex ? styles.stepDone : ''}`}
          >
            <div className={styles.stepDot}>
              {i < stepIndex ? '✓' : i + 1}
            </div>
            {label}
          </div>
          {i < 2 && <div className={styles.stepLine} />}
        </Fragment>
      ))}
    </div>
  )

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && !generating && onClose()}>
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>Generar plan de aprendizaje</h2>
        <StepIndicator />

        {/* ── STEP 1: Selección de objetivo ── */}
        {step === 'goal' && (
          <>
            <p className={styles.modalSubtitle}>
              Selecciona el objetivo para el que quieres un plan personalizado.
            </p>

            {loadingGoals ? (
              <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Cargando objetivos...</p>
            ) : goals.length === 0 ? (
              <>
                <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  Necesitas al menos un objetivo activo. Crea uno en la sección Objetivos.
                </p>
                <Button variant="secondary" onClick={onClose}>Cerrar</Button>
              </>
            ) : (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="goal-select">Objetivo de aprendizaje</label>
                  <select
                    id="goal-select"
                    className={styles.select}
                    value={selectedGoalId}
                    onChange={e => setSelectedGoalId(e.target.value)}
                  >
                    {goals.map(g => (
                      <option key={g.id} value={g.id}>{g.title}</option>
                    ))}
                  </select>
                </div>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0 0 1.5rem' }}>
                  A continuación haremos un breve diagnóstico para adaptar el plan a tu nivel actual.
                </p>
                <div className={styles.modalActions}>
                  <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                  <Button variant="primary" onClick={handleGoalNext} disabled={!selectedGoalId}>
                    Siguiente →
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        {/* ── STEP 2: Test diagnóstico ── */}
        {step === 'diagnostic' && (
          <>
            {loadingDiagnostic ? (
              <p style={{ color: '#64748b', fontSize: '0.875rem', textAlign: 'center', padding: '2rem 0' }}>
                ⏳ Generando preguntas diagnósticas con IA...
              </p>
            ) : (
              <>
                <p className={styles.quizProgress}>
                  Pregunta {currentQ + 1} de {questions.length}
                </p>
                <div className={styles.quizProgressBar}>
                  <div
                    className={styles.quizProgressFill}
                    style={{ width: `${((currentQ + (answered ? 1 : 0)) / questions.length) * 100}%` }}
                  />
                </div>

                {questions[currentQ]?.topic && (
                  <p className={styles.quizTopic}>{questions[currentQ].topic}</p>
                )}
                <p className={styles.quizStem}>{questions[currentQ]?.stem}</p>

                <div className={styles.quizOptions}>
                  {questions[currentQ]?.options.map(opt => {
                    const id = opt.label ?? opt.optionId ?? ''
                    let cls = styles.quizOption
                    if (answered) {
                      if (opt.isCorrect) cls = `${styles.quizOption} ${styles.quizOptionCorrect}`
                      else if (id === selectedOption) cls = `${styles.quizOption} ${styles.quizOptionWrong}`
                    } else if (id === selectedOption) {
                      cls = `${styles.quizOption} ${styles.quizOptionSelected}`
                    }
                    return (
                      <button key={id} className={cls} onClick={() => handleSelectOption(id)}>
                        <strong>{id.toUpperCase()}.</strong> {opt.statement}
                      </button>
                    )
                  })}
                </div>

                <div className={styles.modalActions}>
                  <Button
                    variant="primary"
                    onClick={handleConfirmAnswer}
                    disabled={!selectedOption || answered}
                  >
                    {answered ? 'Siguiente...' : 'Confirmar respuesta'}
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        {/* ── STEP 3: Resultado del diagnóstico ── */}
        {step === 'result' && (
          <>
            {error ? (
              <>
                <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>
                <div className={styles.modalActions}>
                  <Button variant="secondary" onClick={onClose}>Cerrar</Button>
                  <Button variant="primary" onClick={() => handleGenerate()}>Reintentar</Button>
                </div>
              </>
            ) : (
              <>
                <div className={styles.levelResult}>
                  <div className={styles.levelEmoji}>{LEVEL_META[detectedLevel].emoji}</div>
                  <p className={styles.levelTitle}>Nivel detectado</p>
                  <span className={`${styles.levelBadge} ${LEVEL_META[detectedLevel].badgeClass}`}>
                    {LEVEL_META[detectedLevel].label}
                  </span>
                  <p className={styles.levelSubtitle}>{LEVEL_META[detectedLevel].subtitle}</p>
                  <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: '0 0 0.5rem' }}>
                    Aciertos: {answers.filter(a => a.isCorrect).length}/{answers.length}
                  </p>
                </div>
                <div className={styles.modalActions}>
                  <Button variant="secondary" onClick={onClose}>Cancelar</Button>
                  <Button variant="primary" onClick={() => handleGenerate()}>
                    Generar plan →
                  </Button>
                </div>
              </>
            )}
          </>
        )}

        {/* ── GENERATING: spinner ── */}
        {step === 'generating' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <p style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🤖</p>
            <p style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.375rem' }}>
              Generando tu plan personalizado
            </p>
            <p className={styles.generatingNote}>
              Nivel: <strong>{LEVEL_META[detectedLevel].label}</strong> · La IA está creando los módulos y actividades...
            </p>
            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.75rem' }}>
              Esto puede tardar hasta 10 segundos
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
