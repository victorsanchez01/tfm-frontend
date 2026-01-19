//
//  CertificatesPage.tsx
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
  certificatesService, 
  type Certificate 
} from '../../services/certificates'
import { CertificateCard } from './components/CertificateCard'
import { CertificateModal } from './components/CertificateModal'
import styles from './CertificatesPage.module.css'

export function CertificatesPage() {
  const navigate = useNavigate()
  const token = getStoredAccessToken()
  const [loading, setLoading] = useState(true)
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [stats, setStats] = useState<{
    total: number
    issued: number
    processing: number
    pending: number
    totalHours: number
    averageScore: number
  } | null>(null)
  const [filter, setFilter] = useState<'all' | 'issued' | 'processing'>('all')
  const [showVerification, setShowVerification] = useState(false)
  const [verificationCode, setVerificationCode] = useState('')
  const [verifiedCertificate, setVerifiedCertificate] = useState<Certificate | null>(null)
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    loadData()
  }, [token, navigate])

  const loadData = async () => {
    try {
      const [certificatesData, statsData] = await Promise.all([
        certificatesService.getCertificates(),
        certificatesService.getCertificateStats()
      ])
      
      setCertificates(certificatesData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCertificate = async () => {
    if (!verificationCode.trim()) return
    
    try {
      const certificate = await certificatesService.verifyCertificate(verificationCode)
      setVerifiedCertificate(certificate)
    } catch (error) {
      console.error('Error verifying certificate:', error)
      setVerifiedCertificate(null)
    }
  }

  const filteredCertificates = certificates.filter(c => {
    if (filter === 'all') return true
    return c.status === filter
  })

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
          <p style={{ color: '#64748b' }}>Cargando certificados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Mis Certificados</h1>
            <p className={styles.subtitle}>
              Gestiona y comparte tus logros académicos
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Volver
          </Button>
        </div>
      </header>

      <main className={styles.main}>
        {stats && (
          <div className={styles.stats}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.total}</div>
              <div className={styles.statLabel}>Total</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.issued}</div>
              <div className={styles.statLabel}>Emitidos</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{stats.totalHours}</div>
              <div className={styles.statLabel}>Horas totales</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{Math.round(stats.averageScore)}%</div>
              <div className={styles.statLabel}>Promedio</div>
            </div>
          </div>
        )}

        <div className={styles.controls}>
          <div className={styles.filters}>
            <button
              className={`${styles.filter} ${filter === 'all' ? styles.active : ''}`}
              onClick={() => setFilter('all')}
            >
              Todos ({certificates.length})
            </button>
            <button
              className={`${styles.filter} ${filter === 'issued' ? styles.active : ''}`}
              onClick={() => setFilter('issued')}
            >
              Emitidos ({certificates.filter(c => c.status === 'issued').length})
            </button>
            <button
              className={`${styles.filter} ${filter === 'processing' ? styles.active : ''}`}
              onClick={() => setFilter('processing')}
            >
              En proceso ({certificates.filter(c => c.status === 'processing').length})
            </button>
          </div>
          
          <Button
            variant="secondary"
            onClick={() => setShowVerification(!showVerification)}
          >
            Verificar certificado
          </Button>
        </div>

        {showVerification && (
          <div className={styles.verificationPanel}>
            <h3>Verificar autenticidad</h3>
            <div className={styles.verificationForm}>
              <input
                type="text"
                placeholder="Ingresa el código de verificación"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className={styles.verificationInput}
              />
              <Button onClick={handleVerifyCertificate}>
                Verificar
              </Button>
            </div>
            
            {verifiedCertificate && (
              <div className={styles.verifiedCertificate}>
                <h4>Certificado verificado</h4>
                <p><strong>Curso:</strong> {verifiedCertificate.courseName}</p>
                <p><strong>Estudiante:</strong> Usuario Ejemplo</p>
                <p><strong>Fecha de emisión:</strong> {verifiedCertificate.issueDate.toLocaleDateString('es-ES')}</p>
                <p><strong>Calificación:</strong> {verifiedCertificate.score}%</p>
              </div>
            )}
            
            {verifiedCertificate === null && verificationCode && (
              <p className={styles.verificationError}>
                No se encontró ningún certificado con ese código
              </p>
            )}
          </div>
        )}

        <div className={styles.grid}>
          {filteredCertificates.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🏆</div>
              <h3>No tienes certificados</h3>
              <p>
                {filter === 'all' 
                  ? 'Completa cursos para obtener tus certificados' 
                  : `No tienes certificados ${filter === 'issued' ? 'emitidos' : 'en proceso'}`
                }
              </p>
              <Button variant="primary" onClick={() => navigate('/contents')}>
                Explorar cursos
              </Button>
            </div>
          ) : (
            filteredCertificates.map((certificate) => (
              <CertificateCard
                key={certificate.id}
                certificate={certificate}
                onView={(cert) => {
                  setSelectedCertificate(cert)
                  setShowModal(true)
                }}
              />
            ))
          )}
        </div>
      </main>

      <CertificateModal
        certificate={selectedCertificate}
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedCertificate(null)
        }}
      />
    </div>
  )
}
