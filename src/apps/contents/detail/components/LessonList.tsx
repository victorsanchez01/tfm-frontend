//
//  LessonList.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { type Lesson } from '../../../../services/contents/contentsService'
import styles from './LessonList.module.css'

interface LessonListProps {
  lessons: Lesson[]
  onLessonComplete: (lessonId: string) => void
}

export function LessonList({ lessons, onLessonComplete }: LessonListProps) {
  const handleLessonClick = (lessonId: string) => {
    // In a real app, this would navigate to the lesson or open a video player
    onLessonComplete(lessonId)
  }

  if (lessons.length === 0) {
    return (
      <div className={styles.empty}>
        <p>No hay lecciones disponibles aún</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Lecciones del curso</h2>
      <div className={styles.lessons}>
        {lessons.map((lesson, index) => (
          <div
            key={lesson.id}
            className={styles.lesson}
            onClick={() => handleLessonClick(lesson.id)}
          >
            <div className={styles.lessonNumber}>
              <span>{index + 1}</span>
            </div>
            <div className={styles.lessonInfo}>
              <h3 className={styles.lessonTitle}>{lesson.title}</h3>
              <p className={styles.lessonDescription}>{lesson.description}</p>
              <div className={styles.lessonMeta}>
                <span className={styles.duration}>
                  {Math.floor(lesson.duration / 60)}m {lesson.duration % 60 > 0 && `${lesson.duration % 60}s`}
                </span>
                {lesson.status === 'completed' && (
                  <span className={styles.completed}>Completado</span>
                )}
              </div>
            </div>
            <div className={styles.playIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
