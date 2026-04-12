//
//  SkillsPage.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Apr 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@shared/ui'
import { getStoredAccessToken } from '../../services/auth/authService'
import {
  getDomains,
  getSkills,
  type Domain,
  type Skill,
} from '../../services/content/contentService'
import styles from './SkillsPage.module.css'

type LevelFilter = 'ALL' | 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'

const LEVEL_LABELS: Record<string, string> = {
  BEGINNER: 'Básico',
  INTERMEDIATE: 'Intermedio',
  ADVANCED: 'Avanzado',
}

function getLevelClass(level?: string): string {
  switch (level?.toUpperCase()) {
    case 'BEGINNER':     return styles.badgeBeginner
    case 'INTERMEDIATE': return styles.badgeIntermediate
    case 'ADVANCED':     return styles.badgeAdvanced
    default:             return styles.badgeDefault
  }
}

export function SkillsPage() {
  const navigate = useNavigate()
  const { domainId } = useParams<{ domainId: string }>()
  const token = getStoredAccessToken()

  const [domain, setDomain] = useState<Domain | null>(null)
  const [skills, setSkills] = useState<Skill[]>([])
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    if (!domainId) { navigate('/domains'); return }
    loadData(domainId)
  }, [token, domainId, navigate])

  const loadData = async (id: string) => {
    try {
      const [allDomains, allSkills] = await Promise.all([
        getDomains(),
        getSkills(id),
      ])
      setDomain(allDomains.find(d => d.id === id) ?? null)
      setSkills(allSkills)
    } catch (err) {
      console.error('Error loading skills:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = levelFilter === 'ALL'
    ? skills
    : skills.filter(s => s.level?.toUpperCase() === levelFilter)

  const handleViewContents = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/contents?domainId=${domainId}`)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <p className={styles.breadcrumb}>
              <span
                className={styles.breadcrumbLink}
                onClick={() => navigate('/domains')}
              >
                Dominios
              </span>
              {' / '}
              {domain?.name ?? 'Skills'}
            </p>
            <h1 className={styles.title}>
              {domain?.name ?? 'Skills del dominio'}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Button variant="secondary" onClick={() => navigate('/domains')}>
              ← Dominios
            </Button>
            <Button variant="primary" onClick={handleViewContents}>
              Ver contenidos
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.main}>
        {/* Filtros por nivel */}
        <div className={styles.filters}>
          {(['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as LevelFilter[]).map(level => (
            <button
              key={level}
              className={`${styles.filterBtn} ${levelFilter === level ? styles.filterBtnActive : ''}`}
              onClick={() => setLevelFilter(level)}
            >
              {level === 'ALL' ? 'Todos' : LEVEL_LABELS[level]}
            </button>
          ))}
        </div>

        {loading && <p className={styles.loading}>Cargando skills...</p>}

        {!loading && filtered.length === 0 && (
          <p className={styles.empty}>
            {levelFilter !== 'ALL'
              ? `No hay skills de nivel ${LEVEL_LABELS[levelFilter]} en este dominio.`
              : 'No hay skills disponibles en este dominio.'}
          </p>
        )}

        {!loading && filtered.length > 0 && (
          <>
            <p className={styles.count}>
              {filtered.length} skill{filtered.length !== 1 ? 's' : ''}
              {levelFilter !== 'ALL' ? ` de nivel ${LEVEL_LABELS[levelFilter]}` : ''}
            </p>
            <div className={styles.list}>
              {filtered.map(skill => (
                <div key={skill.id} className={styles.card}>
                  <span className={`${styles.cardBadge} ${getLevelClass(skill.level)}`}>
                    {skill.level ? (LEVEL_LABELS[skill.level.toUpperCase()] ?? skill.level) : '—'}
                  </span>
                  <div className={styles.cardBody}>
                    <h3 className={styles.cardName}>{skill.name}</h3>
                    {skill.description && (
                      <p className={styles.cardDescription}>{skill.description}</p>
                    )}
                    <div className={styles.cardMeta}>
                      {skill.prerequisites && skill.prerequisites.length > 0 && (
                        <span className={styles.prerequisites}>
                          🔗 {skill.prerequisites.length} prerrequisito
                          {skill.prerequisites.length !== 1 ? 's' : ''}:&nbsp;
                          {skill.prerequisites.map(p => p.name).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.btnContents}
                      onClick={handleViewContents}
                    >
                      Ver contenidos
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
