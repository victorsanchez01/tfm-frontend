//
//  NotificationButton.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  notificationsService, 
  type Notification 
} from '../../../services/notifications'
import styles from './NotificationButton.module.css'

interface NotificationButtonProps {
  onClick?: () => void
}

export function NotificationButton({ onClick }: NotificationButtonProps) {
  const navigate = useNavigate()
  const [unreadCount, setUnreadCount] = useState(0)
  const [showDropdown, setShowDropdown] = useState(false)
  const [recentNotifications, setRecentNotifications] = useState<Notification[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const [count, notifications] = await Promise.all([
          notificationsService.getUnreadCount(),
          notificationsService.getNotifications()
        ])
        setUnreadCount(count)
        setRecentNotifications(notifications.slice(0, 5))
      } catch (error) {
        console.error('Error loading notification data:', error)
      }
    }

    loadData()
  }, [])

  const handleNotificationClick = (notification: Notification) => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
    }
    setShowDropdown(false)
    
    // Mark as read if unread
    if (!notification.read) {
      notificationsService.markAsRead(notification.id)
      setUnreadCount(prev => Math.max(0, prev - 1))
      setRecentNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
      )
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsService.markAllAsRead()
      setUnreadCount(0)
      setRecentNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleViewAll = () => {
    setShowDropdown(false)
    navigate('/notifications')
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.notificationButton}
        onClick={() => {
          setShowDropdown(!showDropdown)
          onClick?.()
        }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <h3>Notificaciones</h3>
            {unreadCount > 0 && (
              <button className={styles.markAllButton} onClick={handleMarkAllAsRead}>
                Marcar todo como leído
              </button>
            )}
          </div>
          
          <div className={styles.list}>
            {recentNotifications.length === 0 ? (
              <p className={styles.empty}>No tienes notificaciones</p>
            ) : (
              recentNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`${styles.item} ${!notification.read ? styles.unread : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={styles.content}>
                    <div className={styles.titleRow}>
                      <span className={styles.title}>{notification.title}</span>
                      <span className={styles.type} data-type={notification.type}>
                        {notification.type === 'info' && 'ℹ️'}
                        {notification.type === 'success' && '✅'}
                        {notification.type === 'warning' && '⚠️'}
                        {notification.type === 'error' && '❌'}
                      </span>
                    </div>
                    <p className={styles.message}>{notification.message}</p>
                    <div className={styles.footer}>
                      <span className={styles.time}>
                        {formatTime(notification.createdAt)}
                      </span>
                      {notification.actionText && (
                        <span className={styles.action}>{notification.actionText}</span>
                      )}
                    </div>
                  </div>
                  {!notification.read && <div className={styles.dot} />}
                </div>
              ))
            )}
          </div>
          
          <button className={styles.viewAllButton} onClick={handleViewAll}>
            Ver todas las notificaciones
          </button>
        </div>
      )}
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
