//
//  QuizPlayer.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@shared/ui'
import { adaptiveEvaluationService, type Question } from '../../../../services/evaluation'
import styles from './QuizPlayer.module.css'

interface QuizPlayerProps {
  skillId: string
  onComplete: (result: {
    score: number
    total: number
    estimatedLevel: number
    confidence: number
  }) => void
}

export function QuizPlayer({ skillId, onComplete }: QuizPlayerProps) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<string | string[]>('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [questionNumber, setQuestionNumber] = useState(0)
  const [loading, setLoading] = useState(true)
  const [answerStartTime, setAnswerStartTime] = useState<Date>(new Date())
  const [currentLevel, setCurrentLevel] = useState(0.5)

  const loadNextQuestion = useCallback((sessionId: string) => {
    setLoading(true)
    const result = adaptiveEvaluationService.getNextQuestion(sessionId)
    
    if (result.shouldEnd || !result.nextQuestion) {
      // End the evaluation
      const finalResult = adaptiveEvaluationService.endSession(sessionId)
      onComplete({
        score: finalResult.finalScore,
        total: finalResult.totalQuestions,
        estimatedLevel: result.estimatedLevel,
        confidence: result.confidence
      })
    } else {
      setCurrentQuestion(result.nextQuestion)
      setSelectedAnswer('')
      setShowFeedback(false)
      setIsCorrect(false)
      setFeedback('')
      setAnswerStartTime(new Date())
    }
    setLoading(false)
  }, [onComplete])

  // Initialize session on mount
  useEffect(() => {
    if (!skillId) return

    const initializeQuiz = async () => {
      const newSession = adaptiveEvaluationService.createSession('user123', skillId)
      setSessionId(newSession.id)
      loadNextQuestion(newSession.id)
    }
    
    initializeQuiz()
  }, [skillId, loadNextQuestion])

  const handleAnswerSelect = (optionIndex: number) => {
    if (showFeedback || !currentQuestion) return

    const answer = currentQuestion.options[optionIndex]

    if (currentQuestion.type === 'single' || currentQuestion.type === 'true-false') {
      setSelectedAnswer(answer)
    } else if (currentQuestion.type === 'multiple') {
      const current = Array.isArray(selectedAnswer) ? selectedAnswer : []
      const newAnswers = current.includes(answer)
        ? current.filter(a => a !== answer)
        : [...current, answer]
      setSelectedAnswer(newAnswers)
    }
  }

  const handleSubmitAnswer = () => {
    if (!sessionId || !currentQuestion || selectedAnswer === '') return

    const responseTime = new Date().getTime() - answerStartTime.getTime()
    
    const result = adaptiveEvaluationService.submitAnswer(
      sessionId,
      currentQuestion.id,
      selectedAnswer,
      responseTime
    )

    setIsCorrect(result.isCorrect)
    setFeedback(result.feedback)
    setShowFeedback(true)
    setCurrentLevel(result.updatedLevel)
  }

  const handleNextQuestion = () => {
    if (!sessionId) return
    setQuestionNumber(prev => prev + 1)
    loadNextQuestion(sessionId)
  }

  if (loading) {
    return (
      <div className={styles.quizContainer}>
        <div className={styles.loading}>
          <p>Cargando pregunta...</p>
        </div>
      </div>
    )
  }

  if (!currentQuestion) {
    return (
      <div className={styles.quizContainer}>
        <div className={styles.error}>
          <p>No hay preguntas disponibles</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.quizContainer}>
      <div className={styles.header}>
        <div className={styles.progress}>
          <span>Pregunta {questionNumber + 1}</span>
          <div className={styles.levelIndicator}>
            <span className={styles.levelLabel}>
              Nivel: {Math.round(currentLevel * 100)}%
            </span>
            <div className={styles.levelTooltip}>
              <span className={styles.tooltipIcon}>ⓘ</span>
              <div className={styles.tooltipContent}>
                <p>El sistema ajusta la dificultad según tu rendimiento</p>
                <ul>
                  <li>Respuestas correctas → Preguntas más difíciles</li>
                  <li>Respuestas incorrectas → Preguntas más fáciles</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill} 
            style={{ width: `${((questionNumber + 1) / 10) * 100}%` }}
          />
        </div>
      </div>

      <div className={styles.question}>
        <h3>{currentQuestion.question}</h3>
        
        <div className={styles.options}>
          {currentQuestion.options.map((option: string, index: number) => {
            const isSelected = Array.isArray(selectedAnswer) 
              ? selectedAnswer.includes(option)
              : selectedAnswer === option
            
            const showCorrect = showFeedback && Array.isArray(currentQuestion.correctAnswer)
              ? currentQuestion.correctAnswer.includes(option)
              : showFeedback && currentQuestion.correctAnswer === option

            return (
              <button
                key={index}
                className={`${styles.option} ${
                  isSelected ? styles.selected : ''
                } ${
                  showFeedback ? (showCorrect ? styles.correct : styles.incorrect) : ''
                }`}
                onClick={() => handleAnswerSelect(index)}
                disabled={showFeedback}
              >
                {option}
              </button>
            )
          })}
        </div>
      </div>

      {showFeedback && (
        <div className={`${styles.feedback} ${isCorrect ? styles.correct : styles.incorrect}`}>
          <div className={styles.feedbackHeader}>
            <span className={styles.feedbackIcon}>
              {isCorrect ? '✓' : '✗'}
            </span>
            <span className={styles.feedbackTitle}>
              {isCorrect ? '¡Correcto!' : 'Incorrecto'}
            </span>
          </div>
          <p>{feedback}</p>
        </div>
      )}

      <div className={styles.actions}>
        {!showFeedback ? (
          <Button 
            onClick={handleSubmitAnswer}
            disabled={selectedAnswer === ''}
            variant="primary"
          >
            Responder
          </Button>
        ) : (
          <Button onClick={handleNextQuestion} variant="primary">
            Siguiente
          </Button>
        )}
      </div>
    </div>
  )
}
