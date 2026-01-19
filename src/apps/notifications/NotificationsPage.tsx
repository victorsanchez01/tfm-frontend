//
//  NotificationsPage.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@shared/ui'
import { getStoredAccessToken } from '../../services/auth/authService'
import { 
  notificationsService, 
  type Notification,
  type NotificationPreferences 
} from '../../services/notifications'
import styles from './NotificationsPage.module.css'

export function NotificationsPage() {
  const navigate = useNavigate()
  const token = getStoredAccessToken()
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  const [showPreferences, setShowPreferences] = useState(false)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    loadData()
  }, [token, navigate])

  const loadData = async () => {
    try {
      const [notificationsData, preferencesData] = await Promise.all([
        notificationsService.getNotifications(),
        notificationsService.getPreferences()
      ])
      
      setNotifications(notificationsData)
      setPreferences(preferencesData)
    } catch (error) {
      console.error('Error loading notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      )
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleDelete = async (notificationId: string) => {
    try {
      await notificationsService.deleteNotification(notificationId)
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const handleUpdatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    if (!preferences) return
    
    try {
      const updated = await notificationsService.updatePreferences(newPreferences)
      setPreferences(updated)
    } catch (error) {
      console.error('Error updating preferences:', error)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length
  const filteredNotifications = activeTab === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications

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
          <p style={{ color: '#64748b' }}>Cargando notificaciones...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Notificaciones</h1>
            <p className={styles.subtitle}>
              {unreadCount} {unreadCount === 1 ? 'no leída' : 'no leídas'}
            </p>
          </div>
          <div className={styles.headerActions}>
            <Button variant="secondary" onClick={() => setShowPreferences(!showPreferences)}>
              {showPreferences ? 'Ver notificaciones' : 'Preferencias'}
            </Button>
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Volver
            </Button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {showPreferences && preferences ? (
          <div className={styles.preferences}>
            <h2>Preferencias de notificación</h2>
            <div className={styles.preferenceGrid}>
              <label className={styles.preferenceItem}>
                <input
                  type="checkbox"
                  checked={preferences.email}
                  onChange={(e) => handleUpdatePreferences({ email: e.target.checked })}
                />
                <span>Notificaciones por email</span>
              </label>
              <label className={styles.preferenceItem}>
                <input
                  type="checkbox"
                  checked={preferences.push}
                  onChange={(e) => handleUpdatePreferences({ push: e.target.checked })}
                />
                <span>Notificaciones push</span>
              </label>
              <label className={styles.preferenceItem}>
                <input
                  type="checkbox"
                  checked={preferences.studyReminders}
                  onChange={(e) => handleUpdatePreferences({ studyReminders: e.target.checked })}
                />
                <span>Recordatorios de estudio</span>
              </label>
              <label className={styles.preferenceItem}>
                <input
                  type="checkbox"
                  checked={preferences.goalDeadlines}
                  onChange={(e) => handleUpdatePreferences({ goalDeadlines: e.target.checked })}
                />
                <span>Plazos de objetivos</span>
              </label>
              <label className={styles.preferenceItem}>
                <input
                  type="checkbox"
                  checked={preferences.newContent}
                  onChange={(e) => handleUpdatePreferences({ newContent: e.target.checked })}
                />
                <span>Nuevo contenido</span>
              </label>
              <label className={styles.preferenceItem}>
                <input
                  type="checkbox"
                  checked={preferences.achievements}
                  onChange={(e) => handleUpdatePreferences({ achievements: e.target.checked })}
                />
                <span>Logros y achievements</span>
              </label>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.tabs}>
              <button
                className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
                onClick={() => setActiveTab('all')}
              >
                Todas ({notifications.length})
              </button>
              <button
                className={`${styles.tab} ${activeTab === 'unread' ? styles.active : ''}`}
                onClick={() => setActiveTab('unread')}
              >
                No leídas ({unreadCount})
              </button>
              {unreadCount > 0 && (
                <button className={styles.markAllButton} onClick={handleMarkAllAsRead}>
                  Marcar todo como leído
                </button>
              )}
            </div>

            <div className={styles.list}>
              {filteredNotifications.length === 0 ? (
                <div className={styles.empty}>
                  <div className={styles.emptyIcon}>🔔</div>
                  <h3>No tienes notificaciones</h3>
                  <p>
                    {activeTab === 'unread' 
                      ? 'Todas tus notificaciones están leídas' 
                      : 'Te notificaremos cuando haya novedades'
                    }
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`${styles.item} ${!notification.read ? styles.unread : ''}`}
                  >
                    <div className={styles.icon} data-type={notification.type}>
                      {notification.type === 'info' && 'ℹ️'}
                      {notification.type === 'success' && '✅'}
                      {notification.type === 'warning' && '⚠️'}
                      {notification.type === 'error' && '❌'}
                    </div>
                    <div className={styles.content}>
                      <h3>{notification.title}</h3>
                      <p>{notification.message}</p>
                      <div className={styles.footer}>
                        <span className={styles.time}>
                          {formatTime(notification.createdAt)}
                        </span>
                        {notification.actionUrl && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate(notification.actionUrl!)}
                          >
                            {notification.actionText || 'Ver'}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className={styles.actions}>
                      {!notification.read && (
                        <button
                          className={styles.actionButton}
                          onClick={() => handleMarkAsRead(notification.id)}
                          title="Marcar como leído"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}
                      <button
                        className={styles.actionButton}
                        onClick={() => handleDelete(notification.id)}
                        title="Eliminar"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function formatTime(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'ahora'
  if (minutes < 60) return `hace ${minutes} min`
  if (hours < 24) return `hace ${hours} h`
  if (days < 7) return `hace ${days} días`
  return date.toLocaleDateString('es-ES')
}
