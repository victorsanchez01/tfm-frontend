//
//  notificationsService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: Date
  actionUrl?: string
  actionText?: string
}

export interface NotificationPreferences {
  email: boolean
  push: boolean
  studyReminders: boolean
  goalDeadlines: boolean
  newContent: boolean
  achievements: boolean
}

const generateMockNotifications = (): Notification[] => {
  const notifications: Notification[] = []
  
  // Notification for new content
  notifications.push({
    id: '1',
    title: 'Nuevo contenido disponible',
    message: 'Se ha publicado un nuevo curso sobre React Avanzado',
    type: 'info',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    actionUrl: '/contents',
    actionText: 'Ver contenido'
  })
  
  // Study reminder
  notifications.push({
    id: '2',
    title: 'Recordatorio de estudio',
    message: 'No has estudiado hoy. ¡Mantén tu racha de 12 días!',
    type: 'warning',
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    actionUrl: '/dashboard',
    actionText: 'Ir al dashboard'
  })
  
  // Goal completed
  notifications.push({
    id: '3',
    title: '¡Objetivo completado!',
    message: 'Felicidades, has completado el objetivo "Aprender React Básico"',
    type: 'success',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    actionUrl: '/goals',
    actionText: 'Ver logros'
  })
  
  // Achievement unlocked
  notifications.push({
    id: '4',
    title: 'Logro desbloqueado',
    message: 'Has ganado el logro "Estudiante Dedicado" por estudiar 7 días seguidos',
    type: 'success',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
  })
  
  // System maintenance
  notifications.push({
    id: '5',
    title: 'Mantenimiento programado',
    message: 'La plataforma estará en mantenimiento mañana de 2:00 a 4:00 AM',
    type: 'error',
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
  })
  
  return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export const notificationsService = {
  async getNotifications(): Promise<Notification[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return generateMockNotifications()
  },
  
  async markAsRead(notificationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))
    // In a real app, this would make an API call
    console.log(`Marking notification ${notificationId} as read`)
  },
  
  async markAllAsRead(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))
    // In a real app, this would make an API call
    console.log('Marking all notifications as read')
  },
  
  async deleteNotification(notificationId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))
    // In a real app, this would make an API call
    console.log(`Deleting notification ${notificationId}`)
  },
  
  async getPreferences(): Promise<NotificationPreferences> {
    await new Promise(resolve => setTimeout(resolve, 200))
    return {
      email: true,
      push: true,
      studyReminders: true,
      goalDeadlines: true,
      newContent: false,
      achievements: true,
    }
  },
  
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    await new Promise(resolve => setTimeout(resolve, 300))
    // In a real app, this would make an API call
    console.log('Updating notification preferences:', preferences)
    return {
      email: preferences.email ?? true,
      push: preferences.push ?? true,
      studyReminders: preferences.studyReminders ?? true,
      goalDeadlines: preferences.goalDeadlines ?? true,
      newContent: preferences.newContent ?? false,
      achievements: preferences.achievements ?? true,
    }
  },
  
  async getUnreadCount(): Promise<number> {
    await new Promise(resolve => setTimeout(resolve, 100))
    const notifications = generateMockNotifications()
    return notifications.filter(n => !n.read).length
  }
}
