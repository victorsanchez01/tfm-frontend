//
//  QuizPlayer.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useState } from 'react'
import { Button } from '@shared/ui'
import styles from './QuizPlayer.module.css'

interface Question {
  id: string
  question: string
  type: 'single' | 'multiple' | 'true-false'
  options: string[]
  correctAnswer: string | string[]
  explanation: string
}

interface QuizPlayerProps {
  questions: Question[]
  onComplete: (score: number, total: number) => void
}

export function QuizPlayer({ questions, onComplete }: QuizPlayerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string | string[]>>({})
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)

  const question = questions[currentQuestion]
  const isLastQuestion = currentQuestion === questions.length - 1

  const handleAnswerSelect = (optionIndex: number) => {
    if (showFeedback) return

    const answer = question.options[optionIndex]

    if (question.type === 'single' || question.type === 'true-false') {
      setSelectedAnswers({ ...selectedAnswers, [question.id]: answer })
    } else if (question.type === 'multiple') {
      const current = (selectedAnswers[question.id] as string[]) || []
      const newAnswers = current.includes(answer)
        ? current.filter(a => a !== answer)
        : [...current, answer]
      setSelectedAnswers({ ...selectedAnswers, [question.id]: newAnswers })
    }
  }

  const checkAnswer = () => {
    const userAnswer = selectedAnswers[question.id]
    
    if (!userAnswer) return

    let correct = false
    if (Array.isArray(question.correctAnswer)) {
      correct = Array.isArray(userAnswer) && 
        userAnswer.length === question.correctAnswer.length &&
        userAnswer.every(a => question.correctAnswer.includes(a))
    } else {
      correct = userAnswer === question.correctAnswer
    }

    setIsCorrect(correct)
    if (correct) {
      setScore(score + 1)
    }
    setShowFeedback(true)
  }

  const handleNext = () => {
    if (isLastQuestion) {
      setQuizCompleted(true)
      onComplete(score + (isCorrect ? 1 : 0), questions.length)
    } else {
      setCurrentQuestion(currentQuestion + 1)
      setShowFeedback(false)
      setIsCorrect(false)
    }
  }

  const handleRetry = () => {
    setCurrentQuestion(0)
    setSelectedAnswers({})
    setShowFeedback(false)
    setIsCorrect(false)
    setScore(0)
    setQuizCompleted(false)
  }

  if (quizCompleted) {
    const finalScore = score
    const percentage = Math.round((finalScore / questions.length) * 100)

    return (
      <div className={styles.container}>
        <div className={styles.results}>
          <h2>Quiz Completado</h2>
          <div className={styles.score}>
            <span className={styles.scoreNumber}>{finalScore}</span>
            <span className={styles.scoreTotal}>/ {questions.length}</span>
          </div>
          <p className={styles.percentage}>{percentage}% de aciertos</p>
          
          <div className={styles.feedback}>
            {percentage >= 80 ? (
              <p className={styles.excellent}>¡Excelente trabajo!</p>
            ) : percentage >= 60 ? (
              <p className={styles.good}>¡Buen trabajo!</p>
            ) : (
              <p className={styles.needsWork}>Sigue practicando</p>
            )}
          </div>

          <div className={styles.actions}>
            <Button onClick={handleRetry}>Intentar de nuevo</Button>
          </div>
        </div>
      </div>
    )
  }

  const isSelected = (option: string) => {
    const answer = selectedAnswers[question.id]
    if (Array.isArray(answer)) {
      return answer.includes(option)
    }
    return answer === option
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Pregunta {currentQuestion + 1} de {questions.length}</h3>
        <div className={styles.progress}>
          <div 
            className={styles.progressFill}
            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      <div className={styles.question}>
        <h2>{question.question}</h2>
      </div>

      <div className={styles.options}>
        {question.options.map((option, index) => {
          const selected = isSelected(option)
          let className = styles.option
          
          if (showFeedback) {
            const correct = Array.isArray(question.correctAnswer)
              ? question.correctAnswer.includes(option)
              : question.correctAnswer === option
            
            if (correct) {
              className += ` ${styles.correct}`
            } else if (selected && !correct) {
              className += ` ${styles.incorrect}`
            }
          } else if (selected) {
            className += ` ${styles.selected}`
          }

          return (
            <button
              key={index}
              className={className}
              onClick={() => handleAnswerSelect(index)}
              disabled={showFeedback}
            >
              {question.type === 'multiple' && (
                <span className={styles.checkbox}>
                  {selected ? '☑' : '☐'}
                </span>
              )}
              {option}
            </button>
          )
        })}
      </div>

      {showFeedback && (
        <div className={`${styles.feedback} ${isCorrect ? styles.correctFeedback : styles.incorrectFeedback}`}>
          <p>{question.explanation}</p>
        </div>
      )}

      <div className={styles.actions}>
        {!showFeedback ? (
          <Button 
            onClick={checkAnswer}
            disabled={!selectedAnswers[question.id]}
          >
            Responder
          </Button>
        ) : (
          <Button onClick={handleNext}>
            {isLastQuestion ? 'Ver resultados' : 'Siguiente'}
          </Button>
        )}
      </div>
    </div>
  )
}
