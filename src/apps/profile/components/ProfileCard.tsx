//
//  ProfileCard.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import type { ChangeEvent } from 'react'
import { Input } from '@shared/ui'
import { type UserProfile } from '../../../services/profile/profileService'
import styles from './ProfileCard.module.css'

interface ProfileCardProps {
  profile: UserProfile | null
  isEditing: boolean
  formData: {
    firstName: string
    lastName: string
    bio: string
    location: string
    website: string
  }
  onInputChange: (field: string, value: string) => void
  onAvatarUpload: () => void
}

export function ProfileCard({
  profile,
  isEditing,
  formData,
  onInputChange,
  onAvatarUpload,
}: ProfileCardProps) {
  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const _file = e.target.files?.[0]
    if (_file) {
      onAvatarUpload()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
    })
  }

  return (
    <div className={styles.card}>
      <div className={styles.avatarSection}>
        <div className={styles.avatarContainer}>
          {profile?.avatar ? (
            <img src={profile.avatar} alt="Avatar" className={styles.avatar} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {profile?.firstName?.[0]}
              {profile?.lastName?.[0]}
            </div>
          )}
          {isEditing && (
            <label className={styles.avatarUpload}>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className={styles.avatarInput}
              />
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </label>
          )}
        </div>
        <div className={styles.avatarInfo}>
          <h2 className={styles.name}>
            {profile?.firstName} {profile?.lastName}
          </h2>
          <p className={styles.email}>{profile?.email}</p>
          <p className={styles.joined}>
            Se unió en {profile?.joinedAt && formatDate(profile.joinedAt)}
          </p>
        </div>
      </div>

      <div className={styles.infoSection}>
        <div className={styles.infoGroup}>
          <div className={styles.row}>
            <div className={styles.field}>
              <Input
                label="Nombre"
                value={isEditing ? formData.firstName : profile?.firstName || ''}
                onChange={(e) => onInputChange('firstName', e.target.value)}
                disabled={!isEditing}
              />
            </div>
            <div className={styles.field}>
              <Input
                label="Apellido"
                value={isEditing ? formData.lastName : profile?.lastName || ''}
                onChange={(e) => onInputChange('lastName', e.target.value)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.textareaLabel}>Biografía</label>
          <textarea
            className={styles.textarea}
            value={isEditing ? formData.bio : profile?.bio || ''}
            onChange={(e) => onInputChange('bio', e.target.value)}
            disabled={!isEditing}
            rows={4}
            placeholder="Cuéntanos sobre ti..."
          />
        </div>

        <div className={styles.field}>
          <Input
            label="Ubicación"
            value={isEditing ? formData.location : profile?.location || ''}
            onChange={(e) => onInputChange('location', e.target.value)}
            disabled={!isEditing}
            placeholder="Ciudad, País"
          />
        </div>

        <div className={styles.field}>
          <Input
            label="Sitio web"
            type="text"
            value={isEditing ? formData.website : profile?.website || ''}
            onChange={(e) => onInputChange('website', e.target.value)}
            disabled={!isEditing}
            placeholder="https://tu-sitio-web.com"
          />
        </div>
      </div>
    </div>
  )
}
