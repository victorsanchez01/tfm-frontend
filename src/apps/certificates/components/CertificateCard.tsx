//
//  CertificateCard.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useState } from 'react'
import { Button } from '@shared/ui'
import { 
  certificatesService, 
  type Certificate 
} from '../../../services/certificates'
import styles from './CertificateCard.module.css'

interface CertificateCardProps {
  certificate: Certificate
  onView?: (certificate: Certificate) => void
}

export function CertificateCard({ certificate, onView }: CertificateCardProps) {
  const [isDownloading, setIsDownloading] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      await certificatesService.downloadCertificate(certificate.id)
    } catch (error) {
      console.error('Error downloading certificate:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = async (platform: 'linkedin' | 'twitter' | 'email') => {
    setIsSharing(true)
    setShowShareMenu(false)
    try {
      await certificatesService.shareCertificate(certificate.id, platform)
    } catch (error) {
      console.error('Error sharing certificate:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const getStatusColor = () => {
    switch (certificate.status) {
      case 'issued':
        return '#10b981'
      case 'processing':
        return '#f59e0b'
      case 'pending':
        return '#6b7280'
      default:
        return '#6b7280'
    }
  }

  const getStatusText = () => {
    switch (certificate.status) {
      case 'issued':
        return 'Emitido'
      case 'processing':
        return 'En proceso'
      case 'pending':
        return 'Pendiente'
      default:
        return 'Desconocido'
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.icon}>
          🏆
        </div>
        <div className={styles.status} style={{ color: getStatusColor() }}>
          {getStatusText()}
        </div>
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{certificate.title}</h3>
        <p className={styles.description}>{certificate.description}</p>
        
        <div className={styles.courseInfo}>
          <div className={styles.infoRow}>
            <span className={styles.label}>Curso:</span>
            <span className={styles.value}>{certificate.courseName}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Instructor:</span>
            <span className={styles.value}>{certificate.instructorName}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.label}>Fecha de emisión:</span>
            <span className={styles.value}>
              {certificate.issueDate.toLocaleDateString('es-ES')}
            </span>
          </div>
          {certificate.status === 'issued' && (
            <>
              <div className={styles.infoRow}>
                <span className={styles.label}>Calificación:</span>
                <span className={styles.value}>{certificate.score}%</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Horas totales:</span>
                <span className={styles.value}>{certificate.totalHours}h</span>
              </div>
            </>
          )}
        </div>
        
        {certificate.skills.length > 0 && (
          <div className={styles.skills}>
            <span className={styles.skillsLabel}>Competencias:</span>
            <div className={styles.skillsList}>
              {certificate.skills.map((skill: string, index: number) => (
                <span key={index} className={styles.skill}>
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {certificate.verificationCode && (
          <div className={styles.verification}>
            <span className={styles.verificationLabel}>
              Código de verificación:
            </span>
            <code className={styles.verificationCode}>
              {certificate.verificationCode}
            </code>
          </div>
        )}
      </div>
      
      <div className={styles.actions}>
        {onView && (
          <Button
            variant="secondary"
            onClick={() => onView(certificate)}
            className={styles.actionButton}
          >
            Ver certificado
          </Button>
        )}
        
        {certificate.status === 'issued' && (
          <>
            <Button
              variant="primary"
              onClick={handleDownload}
              disabled={isDownloading}
              className={styles.actionButton}
            >
              {isDownloading ? 'Descargando...' : 'Descargar PDF'}
            </Button>
            
            <div className={styles.shareContainer}>
              <Button
                variant="secondary"
                onClick={() => setShowShareMenu(!showShareMenu)}
                disabled={isSharing}
                className={styles.shareButton}
              >
                {isSharing ? 'Compartiendo...' : 'Compartir'}
              </Button>
              
              {showShareMenu && (
                <div className={styles.shareMenu}>
                  <button
                    className={styles.shareOption}
                    onClick={() => handleShare('linkedin')}
                  >
                    <span>💼</span>
                    LinkedIn
                  </button>
                  <button
                    className={styles.shareOption}
                    onClick={() => handleShare('twitter')}
                  >
                    <span>🐦</span>
                    Twitter
                  </button>
                  <button
                    className={styles.shareOption}
                    onClick={() => handleShare('email')}
                  >
                    <span>📧</span>
                    Email
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
