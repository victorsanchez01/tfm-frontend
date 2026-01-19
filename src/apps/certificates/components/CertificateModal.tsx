//
//  CertificateModal.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { Button } from '@shared/ui'
import { type Certificate } from '../../../services/certificates'
import styles from './CertificateModal.module.css'

interface CertificateModalProps {
  certificate: Certificate | null
  isOpen: boolean
  onClose: () => void
}

export function CertificateModal({ certificate, isOpen, onClose }: CertificateModalProps) {
  if (!isOpen || !certificate) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className={styles.backdrop} onClick={handleBackdropClick}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>Vista previa del certificado</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className={styles.certificatePreview}>
          <div className={styles.certificate}>
            <div className={styles.border}>
              <div className={styles.content}>
                <div className={styles.header}>
                  <div className={styles.logo}>
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <h1 className={styles.certificateTitle}>Certificado de Finalización</h1>
                  <p className={styles.subtitle}>Se otorga con orgullo a</p>
                </div>

                <div className={styles.student}>
                  <h2 className={styles.studentName}>Usuario Ejemplo</h2>
                </div>

                <div className={styles.body}>
                  <p className={styles.description}>
                    Por haber completado satisfactoriamente el curso
                  </p>
                  <h3 className={styles.courseName}>{certificate.courseName}</h3>
                  <p className={styles.details}>
                    con una calificación de <span className={styles.score}>{certificate.score}%</span>
                  </p>
                  <p className={styles.duration}>
                    Duración total: {certificate.totalHours} horas
                  </p>
                </div>

                <div className={styles.footer}>
                  <div className={styles.signatures}>
                    <div className={styles.signature}>
                      <div className={styles.line}></div>
                      <p>{certificate.instructorName}</p>
                      <span>Instructor</span>
                    </div>
                    <div className={styles.signature}>
                      <div className={styles.line}></div>
                      <p>Fecha de emisión</p>
                      <span>{certificate.issueDate.toLocaleDateString('es-ES')}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.seal}>
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>

                <div className={styles.verificationCode}>
                  <p>Código de verificación: <strong>{certificate.verificationCode}</strong></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <Button variant="secondary" onClick={onClose}>
            Cerrar
          </Button>
          <Button variant="primary">
            Descargar PDF
          </Button>
        </div>
      </div>
    </div>
  )
}
