//
//  certificatesService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { httpClient, USE_REAL_API } from '../api/httpClient'

export interface Certificate {
  id: string
  title: string
  description: string
  courseName: string
  completionDate: Date
  issueDate: Date
  score: number
  totalHours: number
  skills: string[]
  certificateUrl: string
  verificationCode: string
  status: 'issued' | 'processing' | 'pending'
}

// Backend DTO
interface BackendCertificate {
  id?: string
  certificateId?: string
  title?: string
  planTitle?: string
  courseName?: string
  completionDate?: string
  issuedDate?: string
  issueDate?: string
  score?: number
  totalHours?: number
  skills?: string[]
  certificateUrl?: string
  verificationCode?: string
  status?: string
}

const adaptCertificate = (backend: BackendCertificate): Certificate => ({
  id: backend.id || backend.certificateId || '',
  title: backend.title || 'Certificado de Finalización',
  description: `Ha completado exitosamente: ${backend.courseName || backend.planTitle || ''}`,
  courseName: backend.courseName || backend.planTitle || '',
  completionDate: new Date(backend.completionDate || new Date()),
  issueDate: new Date(backend.issuedDate || backend.issueDate || new Date()),
  score: backend.score || 0,
  totalHours: backend.totalHours || 0,
  skills: backend.skills || [],
  certificateUrl: backend.certificateUrl || '',
  verificationCode: backend.verificationCode || '',
  status: (backend.status?.toLowerCase() as Certificate['status']) || 'issued',
})

const getCertificatesAPI = async (): Promise<Certificate[]> => {
  const userId = localStorage.getItem('user_id') || ''
  const response = await httpClient
    .get<BackendCertificate[]>(`/planning/plans/certificates?userId=${userId}`)
    .catch(() => [] as BackendCertificate[])
  return (Array.isArray(response) ? response : []).map(adaptCertificate)
}

// Mock data
const generateMockCertificates = (): Certificate[] => [
  {
    id: '1',
    title: 'Certificado de Finalización',
    description: 'Ha completado exitosamente el curso de React Fundamentals',
    courseName: 'React Fundamentals',
    completionDate: new Date('2024-01-10'),
    issueDate: new Date('2024-01-11'),
    score: 95,
    totalHours: 40,
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Hooks', 'Components'],
    certificateUrl: '/certificates/react-fundamentals-abc123.pdf',
    verificationCode: 'ABC123XYZ',
    status: 'issued',
  },
  {
    id: '2',
    title: 'Certificado de Finalización',
    description: 'Ha completado exitosamente el curso de TypeScript Avanzado',
    courseName: 'TypeScript Avanzado',
    completionDate: new Date('2024-01-05'),
    issueDate: new Date('2024-01-06'),
    score: 88,
    totalHours: 35,
    skills: ['TypeScript', 'Interfaces', 'Generics', 'Decorators', 'Advanced Types'],
    certificateUrl: '/certificates/typescript-advanced-def456.pdf',
    verificationCode: 'DEF456UVW',
    status: 'issued',
  },
]

export const certificatesService = {
  async getCertificates(): Promise<Certificate[]> {
    if (USE_REAL_API) return getCertificatesAPI()
    await new Promise(resolve => setTimeout(resolve, 300))
    return generateMockCertificates()
  },

  async getCertificateById(id: string): Promise<Certificate | null> {
    const certs = await this.getCertificates()
    return certs.find(c => c.id === id) || null
  },

  async verifyCertificate(code: string): Promise<Certificate | null> {
    await new Promise(resolve => setTimeout(resolve, 300))
    const certs = generateMockCertificates()
    return certs.find(c => c.verificationCode === code) || null
  },

  async downloadCertificate(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log(`Downloading certificate ${id}`)
    const link = document.createElement('a')
    link.href = `/certificates/certificate-${id}.pdf`
    link.download = `certificate-${id}.pdf`
    link.click()
  },

  async shareCertificate(id: string, platform: 'linkedin' | 'twitter' | 'email'): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const certificate = await this.getCertificateById(id)
    if (!certificate) return

    const shareText = `¡He completado el curso "${certificate.courseName}" con una calificación de ${certificate.score}%!`
    const shareUrl = window.location.origin

    switch (platform) {
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`)
        break
      case 'twitter':
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${shareUrl}`
        )
        break
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent('Certificado de Finalización')}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`
        break
    }
  },

  async getCertificateStats(): Promise<{
    total: number
    issued: number
    processing: number
    pending: number
    totalHours: number
    averageScore: number
  }> {
    const certificates = await this.getCertificates()
    return {
      total: certificates.length,
      issued: certificates.filter(c => c.status === 'issued').length,
      processing: certificates.filter(c => c.status === 'processing').length,
      pending: certificates.filter(c => c.status === 'pending').length,
      totalHours: certificates.reduce((sum, c) => sum + c.totalHours, 0),
      averageScore: certificates
        .filter(c => c.status === 'issued')
        .reduce((sum, c, _, arr) => sum + c.score / arr.length, 0),
    }
  },
}
