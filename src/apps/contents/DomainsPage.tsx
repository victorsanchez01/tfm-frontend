//
//  DomainsPage.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Apr 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@shared/ui'
import { getStoredAccessToken } from '../../services/auth/authService'
import { getDomains, type Domain } from '../../services/content/contentService'
import styles from './DomainsPage.module.css'

const DOMAIN_ICONS: Record<string, string> = {
  BACKEND: '⚙️',
  FRONTEND: '🎨',
  DATA: '📊',
  DEVOPS: '🚀',
  MOBILE: '📱',
  AI: '🤖',
  SECURITY: '🔒',
  DEFAULT: '📚',
}

function getDomainIcon(code: string): string {
  const upper = code?.toUpperCase() ?? ''
  return Object.keys(DOMAIN_ICONS).find(k => upper.includes(k))
    ? DOMAIN_ICONS[Object.keys(DOMAIN_ICONS).find(k => upper.includes(k))!]
    : DOMAIN_ICONS.DEFAULT
}

export function DomainsPage() {
  const navigate = useNavigate()
  const token = getStoredAccessToken()

  const [domains, setDomains] = useState<Domain[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    loadDomains()
  }, [token, navigate])

  const loadDomains = async () => {
    try {
      const data = await getDomains()
      setDomains(data)
    } catch (err) {
      console.error('Error loading domains:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = domains.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.description?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Dominios de Conocimiento</h1>
            <p className={styles.subtitle}>
              Explora las áreas temáticas disponibles en la plataforma
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </Button>
        </div>
      </div>

      <div className={styles.main}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Buscar dominio..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading && <p className={styles.loading}>Cargando dominios...</p>}

        {!loading && filtered.length === 0 && (
          <p className={styles.empty}>
            {search ? `Sin resultados para "${search}"` : 'No hay dominios disponibles.'}
          </p>
        )}

        {!loading && filtered.length > 0 && (
          <div className={styles.grid}>
            {filtered.map(domain => (
              <div
                key={domain.id}
                className={styles.card}
                onClick={() => navigate(`/domains/${domain.id}/skills`)}
              >
                <div className={styles.cardIcon}>
                  {getDomainIcon(domain.code)}
                </div>
                <h2 className={styles.cardName}>{domain.name}</h2>
                <p className={styles.cardDescription}>{domain.description}</p>
                <div className={styles.cardFooter}>
                  <span className={styles.cardSkillCount}>
                    {domain.skillCount != null ? `${domain.skillCount} skills` : 'Ver skills'}
                  </span>
                  <span className={styles.cardArrow}>Explorar →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
