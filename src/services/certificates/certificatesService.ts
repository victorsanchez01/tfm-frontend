//
//  certificatesService.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

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

const generateMockCertificates = (): Certificate[] => {
  const certificates: Certificate[] = []
  
  // React Fundamentals Certificate
  certificates.push({
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
    status: 'issued'
  })
  
  // TypeScript Advanced Certificate
  certificates.push({
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
    status: 'issued'
  })
  
  // Node.js Backend Certificate
  certificates.push({
    id: '3',
    title: 'Certificado de Finalización',
    description: 'Ha completado exitosamente el curso de Node.js Backend Development',
    courseName: 'Node.js Backend Development',
    completionDate: new Date('2023-12-20'),
    issueDate: new Date('2023-12-21'),
    score: 92,
    totalHours: 45,
    skills: ['Node.js', 'Express', 'MongoDB', 'REST APIs', 'Authentication'],
    certificateUrl: '/certificates/nodejs-backend-ghi789.pdf',
    verificationCode: 'GHI789RST',
    status: 'issued'
  })
  
  // In Progress Certificate
  certificates.push({
    id: '4',
    title: 'Certificado de Finalización',
    description: 'Completando el curso de Vue.js 3 Completo',
    courseName: 'Vue.js 3 Completo',
    completionDate: new Date(), // Not completed yet
    issueDate: new Date(),
    score: 0,
    totalHours: 50,
    skills: ['Vue.js', 'Composition API', 'Vuex', 'Vue Router'],
    certificateUrl: '',
    verificationCode: '',
    status: 'processing'
  })
  
  return certificates.sort((a, b) => b.issueDate.getTime() - a.issueDate.getTime())
}

export const certificatesService = {
  async getCertificates(): Promise<Certificate[]> {
    await new Promise(resolve => setTimeout(resolve, 300))
    return generateMockCertificates()
  },
  
  async getCertificateById(id: string): Promise<Certificate | null> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const certificates = generateMockCertificates()
    return certificates.find(c => c.id === id) || null
  },
  
  async verifyCertificate(code: string): Promise<Certificate | null> {
    await new Promise(resolve => setTimeout(resolve, 300))
    const certificates = generateMockCertificates()
    return certificates.find(c => c.verificationCode === code) || null
  },
  
  async downloadCertificate(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500))
    // In a real app, this would generate and download a PDF
    console.log(`Downloading certificate ${id}`)
    // For demo purposes, we'll create a simple PDF download
    const link = document.createElement('a')
    link.href = `/certificates/certificate-${id}.pdf`
    link.download = `certificate-${id}.pdf`
    link.click()
  },
  
  async shareCertificate(id: string, platform: 'linkedin' | 'twitter' | 'email'): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const certificate = await certificatesService.getCertificateById(id)
    if (!certificate) return
    
    const shareText = `¡He completado el curso "${certificate.courseName}" con una calificación de ${certificate.score}%!`
    const shareUrl = window.location.origin
    
    switch (platform) {
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`)
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${shareUrl}`)
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
    await new Promise(resolve => setTimeout(resolve, 200))
    const certificates = generateMockCertificates()
    
    return {
      total: certificates.length,
      issued: certificates.filter(c => c.status === 'issued').length,
      processing: certificates.filter(c => c.status === 'processing').length,
      pending: certificates.filter(c => c.status === 'pending').length,
      totalHours: certificates.reduce((sum, c) => sum + c.totalHours, 0),
      averageScore: certificates
        .filter(c => c.status === 'issued')
        .reduce((sum, c, _, arr) => sum + c.score / arr.length, 0)
    }
  }
}
