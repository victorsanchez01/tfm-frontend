//
//  ProfilePage.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@shared/ui'
import { getStoredAccessToken } from '../../services/auth/authService'
import { profileService, type UserProfile } from '../../services/profile/profileService'
import { ProfileCard, StatsCard } from './components'
import styles from './ProfilePage.module.css'

type Toast = { message: string; type: 'success' | 'error' }

export function ProfilePage() {
  const navigate = useNavigate()
  const token = getStoredAccessToken()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<Toast | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    website: '',
  })

  const showToast = (message: string, type: Toast['type']) => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    loadProfile()
  }, [token, navigate])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const loaded = await profileService.getProfile()
      setProfile(loaded)
      setFormData({
        firstName: loaded.firstName,
        lastName: loaded.lastName,
        bio: loaded.bio || '',
        location: loaded.location || '',
        website: loaded.website || '',
      })
    } catch {
      console.log('Profile endpoint not available, using fallback data')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
      })
    }
  }

  const handleSave = async () => {
    if (!profile) return

    try {
      setSaving(true)
      const updated = await profileService.updateProfile(formData)
      setProfile(updated)
      setIsEditing(false)
      showToast('Perfil guardado correctamente', 'success')
    } catch (error) {
      console.error('Error saving profile:', error)
      showToast('Error al guardar el perfil. Inténtalo de nuevo.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAvatarUpload = async (file: File) => {
    if (!profile) return

    try {
      const avatarUrl = await profileService.uploadAvatar(file)
      setProfile(prev => prev ? { ...prev, avatar: avatarUrl } : null)
      showToast('Foto de perfil actualizada', 'success')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      showToast('Error al subir la foto. Inténtalo de nuevo.', 'error')
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
          <p style={{ color: '#64748b' }}>Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Mi Perfil</h1>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Volver al dashboard
          </Button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.grid}>
          <div className={styles.leftColumn}>
            <ProfileCard
              profile={profile}
              isEditing={isEditing}
              formData={formData}
              onInputChange={handleInputChange}
              onAvatarUpload={handleAvatarUpload}
            />
          </div>
          
          <div className={styles.rightColumn}>
            <StatsCard stats={profile?.stats} />
            
            <div className={styles.actions}>
              {!isEditing ? (
                <Button onClick={handleEdit} className={styles.fullWidth}>
                  Editar perfil
                </Button>
              ) : (
                <div className={styles.editActions}>
                  <Button
                    variant="secondary"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSave}
                    loading={saving}
                    disabled={saving}
                  >
                    {saving ? 'Guardando...' : 'Guardar cambios'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {toast && (
        <div className={`${styles.toast} ${toast.type === 'success' ? styles.toastSuccess : styles.toastError}`}>
          {toast.type === 'success' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          {toast.message}
        </div>
      )}
    </div>
  )
}
