//
//  DashboardPageSimple.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@shared/ui'
import { getStoredAccessToken, clearTokens } from '../../services/auth/authService'

export function DashboardPageSimple() {
  const navigate = useNavigate()
  const token = getStoredAccessToken()

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token, navigate])

  const handleLogout = () => {
    clearTokens()
    navigate('/login')
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-600">Redirigiendo al login...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
              <p className="text-sm text-slate-500">Gestiona tu aprendizaje</p>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Perfil</h3>
            <p className="text-sm text-slate-600 mb-4">Configura tu información personal</p>
            <Button variant="secondary" className="w-full">
              Editar perfil
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Objetivos</h3>
            <p className="text-sm text-slate-600 mb-4">3 objetivos en progreso</p>
            <Button variant="secondary" className="w-full">
              Ver objetivos
            </Button>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h3 className="text-lg font-medium text-slate-900 mb-2">Contenidos</h3>
            <p className="text-sm text-slate-600 mb-4">Explora el catálogo</p>
            <Button variant="secondary" className="w-full">
              Explorar
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
