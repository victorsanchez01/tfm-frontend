//
//  adaptiveEvaluationService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

export interface Question {
  id: string
  question: string
  type: 'single' | 'multiple' | 'true-false'
  options: string[]
  correctAnswer: string | string[]
  explanation: string
  difficulty: number // 0-1, where 0.5 is medium
  skillId: string
}

export interface EvaluationSession {
  id: string
  userId: string
  skillId: string
  startTime: Date
  endTime?: Date
  currentLevel: number // 0-1, estimated skill level
  questions: Question[]
  answers: Array<{
    questionId: string
    answer: string | string[]
    isCorrect: boolean
    responseTime: number
    timestamp: Date
  }>
  isActive: boolean
}

export interface AdaptiveResult {
  nextQuestion: Question | null
  shouldEnd: boolean
  estimatedLevel: number
  confidence: number
}

class AdaptiveEvaluationService {
  private sessions = new Map<string, EvaluationSession>()
  
  // Simulated question bank with different difficulties
  private questionBank: Question[] = [
    // Frontend questions (difficulty 0.2-0.9)
    {
      id: 'q1',
      question: '¿Qué es React?',
      type: 'single',
      options: ['Una librería de UI', 'Un framework', 'Un lenguaje', 'Una base de datos'],
      correctAnswer: 'Una librería de UI',
      explanation: 'React es una librería JavaScript para construir interfaces de usuario.',
      difficulty: 0.3,
      skillId: 'Frontend'
    },
    {
      id: 'q2',
      question: '¿React utiliza un DOM virtual?',
      type: 'true-false',
      options: ['Verdadero', 'Falso'],
      correctAnswer: 'Verdadero',
      explanation: 'React utiliza un DOM virtual para optimizar las actualizaciones de la UI.',
      difficulty: 0.4,
      skillId: 'Frontend'
    },
    {
      id: 'q3',
      question: '¿Cuál es la diferencia entre useState y useReducer?',
      type: 'single',
      options: [
        'useState es para estado simple, useReducer para estado complejo',
        'useReducer es más rápido',
        'No hay diferencia',
        'useState es para clases, useReducer para funciones'
      ],
      correctAnswer: 'useState es para estado simple, useReducer para estado complejo',
      explanation: 'useState es ideal para estado simple, mientras que useReducer es mejor para lógica de estado compleja.',
      difficulty: 0.6,
      skillId: 'Frontend'
    },
    {
      id: 'q4',
      question: '¿Qué es el useEffect en React?',
      type: 'single',
      options: [
        'Un hook para efectos secundarios',
        'Un componente',
        'Un método de ciclo de vida',
        'Un estado'
      ],
      correctAnswer: 'Un hook para efectos secundarios',
      explanation: 'useEffect es un hook que te permite realizar efectos secundarios en componentes funcionales.',
      difficulty: 0.5,
      skillId: 'Frontend'
    },
    {
      id: 'q5',
      question: '¿Cómo optimiza React el rendimiento con memo?',
      type: 'multiple',
      options: [
        'Evita re-renders innecesarios',
        'Memoriza el resultado de renderizado',
        'Compara props superficialmente',
        'Reduce el tamaño del bundle'
      ],
      correctAnswer: ['Evita re-renders innecesarios', 'Memoriza el resultado de renderizado', 'Compara props superficialmente'],
      explanation: 'React.memo memoriza el resultado del renderizado y evita re-renders cuando las props no han cambiado.',
      difficulty: 0.8,
      skillId: 'Frontend'
    },
    // Backend questions
    {
      id: 'q6',
      question: '¿Qué es REST?',
      type: 'single',
      options: [
        'Un estilo de arquitectura para APIs',
        'Un lenguaje de programación',
        'Una base de datos',
        'Un framework'
      ],
      correctAnswer: 'Un estilo de arquitectura para APIs',
      explanation: 'REST es un estilo arquitectónico para diseñar APIs web.',
      difficulty: 0.4,
      skillId: 'Backend'
    },
    {
      id: 'q7',
      question: '¿Qué método HTTP se usa para crear recursos?',
      type: 'single',
      options: ['GET', 'POST', 'PUT', 'DELETE'],
      correctAnswer: 'POST',
      explanation: 'POST se usa para crear nuevos recursos en un servidor.',
      difficulty: 0.3,
      skillId: 'Backend'
    },
    // Lenguajes questions
    {
      id: 'q8',
      question: '¿Qué es TypeScript?',
      type: 'single',
      options: [
        'JavaScript con tipos',
        'Un nuevo lenguaje',
        'Un framework de JavaScript',
        'Una librería'
      ],
      correctAnswer: 'JavaScript con tipos',
      explanation: 'TypeScript es un superconjunto de JavaScript que añade tipos estáticos.',
      difficulty: 0.4,
      skillId: 'Lenguajes'
    },
    {
      id: 'q9',
      question: '¿Qué es una interfaz en TypeScript?',
      type: 'single',
      options: [
        'Define la forma de un objeto',
        'Una clase',
        'Una función',
        'Un módulo'
      ],
      correctAnswer: 'Define la forma de un objeto',
      explanation: 'Las interfaces en TypeScript definen la estructura que deben tener los objetos.',
      difficulty: 0.6,
      skillId: 'Lenguajes'
    },
    // Default questions for other categories
    {
      id: 'q10',
      question: '¿Cuál es el principio DRY?',
      type: 'single',
      options: [
        "Don't Repeat Yourself",
        'Do Right Yourself',
        'Data Ready Yesterday',
        'Design Review Yesterday'
      ],
      correctAnswer: "Don't Repeat Yourself",
      explanation: 'DRY (Don\'t Repeat Yourself) es un principio que busca evitar la duplicación de código.',
      difficulty: 0.5,
      skillId: 'General'
    }
  ]

  createSession(userId: string, skillId: string): EvaluationSession {
    const session: EvaluationSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      skillId,
      startTime: new Date(),
      currentLevel: 0.5, // Start with medium difficulty
      questions: [],
      answers: [],
      isActive: true
    }

    this.sessions.set(session.id, session)
    return session
  }

  // Select next question using adaptive algorithm
  getNextQuestion(sessionId: string): AdaptiveResult {
    const session = this.sessions.get(sessionId)
    if (!session || !session.isActive) {
      return {
        nextQuestion: null,
        shouldEnd: true,
        estimatedLevel: 0,
        confidence: 0
      }
    }

    // Maximum 10 questions per session
    if (session.answers.length >= 10) {
      return {
        nextQuestion: null,
        shouldEnd: true,
        estimatedLevel: session.currentLevel,
        confidence: this.calculateConfidence(session.answers.length)
      }
    }

    // Select question based on current estimated level
    const targetDifficulty = session.currentLevel
    let availableQuestions = this.questionBank.filter(
      q => q.skillId === session.skillId && 
      !session.questions.some(asked => asked.id === q.id)
    )

    // If no questions for this category, use General questions
    if (availableQuestions.length === 0) {
      availableQuestions = this.questionBank.filter(
        q => q.skillId === 'General' && 
        !session.questions.some(asked => asked.id === q.id)
      )
    }

    if (availableQuestions.length === 0) {
      return {
        nextQuestion: null,
        shouldEnd: true,
        estimatedLevel: session.currentLevel,
        confidence: this.calculateConfidence(session.answers.length)
      }
    }

    // Find question closest to target difficulty
    let bestQuestion = availableQuestions[0]
    let minDiff = Math.abs(bestQuestion.difficulty - targetDifficulty)

    for (const question of availableQuestions) {
      const diff = Math.abs(question.difficulty - targetDifficulty)
      if (diff < minDiff) {
        minDiff = diff
        bestQuestion = question
      }
    }

    session.questions.push(bestQuestion)

    return {
      nextQuestion: bestQuestion,
      shouldEnd: false,
      estimatedLevel: session.currentLevel,
      confidence: this.calculateConfidence(session.answers.length)
    }
  }

  // Submit answer and update estimated level
  submitAnswer(
    sessionId: string, 
    questionId: string, 
    answer: string | string[], 
    responseTime: number
  ): {
    isCorrect: boolean
    updatedLevel: number
    feedback: string
  } {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error('Session not found')
    }

    const question = session.questions.find(q => q.id === questionId)
    if (!question) {
      throw new Error('Question not found in session')
    }

    // Check if answer is correct
    let isCorrect = false
    if (Array.isArray(question.correctAnswer)) {
      isCorrect = Array.isArray(answer) && 
        question.correctAnswer.length === answer.length &&
        question.correctAnswer.every(ca => answer.includes(ca))
    } else {
      isCorrect = answer === question.correctAnswer
    }

    // Record answer
    session.answers.push({
      questionId,
      answer,
      isCorrect,
      responseTime,
      timestamp: new Date()
    })

    // Update estimated level using simplified IRT
    const previousLevel = session.currentLevel
    session.currentLevel = this.updateSkillLevel(previousLevel, question.difficulty, isCorrect)

    return {
      isCorrect,
      updatedLevel: session.currentLevel,
      feedback: question.explanation
    }
  }

  // Simplified IRT-like algorithm to update skill level
  private updateSkillLevel(currentLevel: number, questionDifficulty: number, isCorrect: boolean): number {
    // Learning rate - higher for more surprising results
    const surprise = isCorrect ? (1 - currentLevel) : currentLevel
    const learningRate = 0.3 * surprise

    // Update level
    let newLevel = currentLevel
    if (isCorrect) {
      // Correct answer increases level, more so for harder questions
      newLevel += learningRate * (questionDifficulty - currentLevel + 0.5)
    } else {
      // Incorrect answer decreases level, more so for easier questions
      newLevel -= learningRate * (currentLevel - questionDifficulty + 0.5)
    }

    // Clamp between 0 and 1
    return Math.max(0, Math.min(1, newLevel))
  }

  private calculateConfidence(answerCount: number): number {
    // Confidence increases with more answers
    // Using a simple formula: 1 - e^(-0.5 * n)
    return 1 - Math.exp(-0.5 * answerCount)
  }

  endSession(sessionId: string): {
    finalScore: number
    estimatedLevel: number
    confidence: number
    totalQuestions: number
    correctAnswers: number
  } {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error('Session not found')
    }

    session.isActive = false
    session.endTime = new Date()

    const correctAnswers = session.answers.filter(a => a.isCorrect).length
    const finalScore = session.answers.length > 0 ? (correctAnswers / session.answers.length) * 100 : 0

    return {
      finalScore,
      estimatedLevel: session.currentLevel,
      confidence: this.calculateConfidence(session.answers.length),
      totalQuestions: session.answers.length,
      correctAnswers
    }
  }

  getSession(sessionId: string): EvaluationSession | undefined {
    return this.sessions.get(sessionId)
  }
}

export const adaptiveEvaluationService = new AdaptiveEvaluationService()
