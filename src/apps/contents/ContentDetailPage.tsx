//
//  ContentDetailPage.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright 2026 Victor Sanchez. All rights reserved.
//

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@shared/ui'
import { getStoredAccessToken } from '../../services/auth/authService'
import { contentsService, type Content, type Course } from '../../services/contents/contentsService'
import { ContentHeader, ContentTabs, LessonList, ResourceList } from './detail'
import styles from './ContentDetailPage.module.css'

export function ContentDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const token = getStoredAccessToken()
  const [content, setContent] = useState<Content | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'lessons' | 'resources'>('overview')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    if (!id) {
      navigate('/contents')
      return
    }

    loadContent()
  }, [token, id, navigate])

  const loadContent = async () => {
    try {
      const data = await contentsService.getContent(id!)
      if (!data) {
        navigate('/contents')
        return
      }
      setContent(data)
    } catch (error) {
      console.error('Error loading content:', error)
      navigate('/contents')
    } finally {
      setLoading(false)
    }
  }

  const handleStartContent = async () => {
    if (!content) return

    try {
      // Update progress to 1% to mark as started
      await contentsService.updateProgress(content.id, content.progress > 0 ? content.progress : 1)
      setContent(prev => prev ? { ...prev, progress: prev.progress > 0 ? prev.progress : 1 } : null)
    } catch (error) {
      console.error('Error starting content:', error)
    }
  }

  const handleCompleteLesson = async () => {
    if (!content) return

    try {
      // In a real app, this would mark the specific lesson as complete
      // For now, we'll just update the overall progress
      const newProgress = Math.min(content.progress + 10, 100)
      await contentsService.updateProgress(content.id, newProgress)
      setContent(prev => prev ? { ...prev, progress: newProgress } : null)
    } catch (error) {
      console.error('Error completing lesson:', error)
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
          <p style={{ color: '#64748b' }}>Cargando contenido...</p>
        </div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <p style={{ color: '#64748b' }}>Contenido no encontrado</p>
        </div>
      </div>
    )
  }

  const isCourse = content.type === 'course'
  const course = isCourse ? content as Course : null

  return (
    <div className={styles.container}>
      <ContentHeader content={content} />

      <main className={styles.main}>
        <div className={styles.sidebar}>
          <div className={styles.actions}>
            {content.status === 'not_started' ? (
              <Button onClick={handleStartContent} className={styles.startButton}>
                Comenzar ahora
              </Button>
            ) : (
              <Button onClick={handleStartContent} className={styles.continueButton}>
                {content.progress === 100 ? 'Ver de nuevo' : 'Continuar'}
              </Button>
            )}
          </div>

          {content.progress > 0 && (
            <div className={styles.progressSection}>
              <h3>Tu progreso</h3>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${content.progress}%` }}
                ></div>
              </div>
              <p className={styles.progressText}>{content.progress}% completado</p>
            </div>
          )}

          <div className={styles.info}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Instructor</span>
              <span className={styles.value}>{content.instructor}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Duración</span>
              <span className={styles.value}>
                {Math.floor(content.duration / 60)}h {content.duration % 60}m
              </span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Nivel</span>
              <span className={styles.value}>
                {content.level === 'beginner' ? 'Principiante' :
                 content.level === 'intermediate' ? 'Intermedio' : 'Avanzado'}
              </span>
            </div>
          </div>
        </div>

        <div className={styles.content}>
          <ContentTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            isCourse={isCourse}
            hasResources={true}
          />

          {activeTab === 'overview' && (
            <div className={styles.tabContent}>
              <div className={styles.description}>
                <h2>Descripción</h2>
                <p>{content.description}</p>
              </div>

              <div className={styles.tags}>
                <h3>Etiquetas</h3>
                <div className={styles.tagList}>
                  {content.tags.map((tag: string) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'lessons' && isCourse && course && (
            <div className={styles.tabContent}>
              <LessonList
                lessons={course.lessons}
                onLessonComplete={handleCompleteLesson}
              />
            </div>
          )}

          {activeTab === 'resources' && (
            <div className={styles.tabContent}>
              <ResourceList resources={[]} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
