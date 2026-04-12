//
//  MasteryPage.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Apr 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@shared/ui'
import { getStoredAccessToken } from '../../services/auth/authService'
import { getMastery } from '../../services/assessment/assessmentService'
import styles from './MasteryPage.module.css'

interface SkillMastery {
  skillId: string
  skillName: string
  domainName: string
  mastery: number      // 0.0 – 1.0
  attempts: number
  lastUpdate: string
}

function getTrendIcon(trend?: string): string {
  switch (trend) {
    case 'improving': return '↑'
    case 'declining': return '↓'
    default:          return '→'
  }
}

function getTrendColor(trend?: string): string {
  switch (trend) {
    case 'improving': return '#22c55e'
    case 'declining': return '#ef4444'
    default:          return '#94a3b8'
  }
}

function getFillClass(mastery: number, s: typeof styles): string {
  if (mastery >= 0.7) return s.fillHigh
  if (mastery >= 0.4) return s.fillMid
  return s.fillLow
}

export function MasteryPage() {
  const navigate = useNavigate()
  const token = getStoredAccessToken()

  const [masteryList, setMasteryList] = useState<SkillMastery[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) { navigate('/login'); return }
    loadMastery()
  }, [token, navigate])

  const loadMastery = async () => {
    const userId = localStorage.getItem('user_id') ?? ''
    try {
      const data = await getMastery(userId)
      setMasteryList(data as unknown as SkillMastery[])
    } catch (err) {
      console.error('Error loading mastery:', err)
    } finally {
      setLoading(false)
    }
  }

  const needsAttention = masteryList.filter(s => s.mastery < 0.4)
  const avgMastery = masteryList.length > 0
    ? masteryList.reduce((acc, s) => acc + s.mastery, 0) / masteryList.length
    : 0
  const sorted = [...masteryList].sort((a, b) => b.mastery - a.mastery)

  if (loading) {
    return (
      <div className={styles.container}>
        <p className={styles.loading}>Cargando nivel de dominio...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Nivel de Dominio por Skill</h1>
            <p className={styles.subtitle}>
              Tu progreso en cada habilidad evaluada
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            ← Dashboard
          </Button>
        </div>
      </div>

      <div className={styles.main}>
        {masteryList.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎯</div>
            <h2 className={styles.emptyTitle}>Sin evaluaciones todavía</h2>
            <p className={styles.emptyText}>
              Completa una evaluación adaptativa para ver tu nivel de dominio por habilidad.
            </p>
            <Button variant="primary" onClick={() => navigate('/contents')}>
              Explorar contenidos
            </Button>
          </div>
        ) : (
          <>
            {/* Resumen */}
            <div className={styles.summary}>
              <div className={styles.summaryCard}>
                <p className={styles.summaryValue}>
                  {Math.round(avgMastery * 100)}%
                </p>
                <p className={styles.summaryLabel}>Dominio promedio</p>
              </div>
              <div className={styles.summaryCard}>
                <p className={styles.summaryValue}>{masteryList.length}</p>
                <p className={styles.summaryLabel}>Skills evaluadas</p>
              </div>
              <div className={styles.summaryCard}>
                <p className={styles.summaryValue}>
                  {masteryList.filter(s => s.mastery >= 0.7).length}
                </p>
                <p className={styles.summaryLabel}>Skills dominadas</p>
              </div>
              <div className={styles.summaryCard}>
                <p className={styles.summaryValue}>{needsAttention.length}</p>
                <p className={styles.summaryLabel}>Requieren atención</p>
              </div>
            </div>

            {/* Skills que necesitan atención */}
            {needsAttention.length > 0 && (
              <div className={styles.attention}>
                <p className={styles.attentionTitle}>
                  ⚠️ Skills con bajo nivel de dominio (&lt; 40%)
                </p>
                <ul className={styles.attentionList}>
                  {needsAttention.map(s => (
                    <li key={s.skillId}>
                      {s.skillName} — {Math.round(s.mastery * 100)}%
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Lista completa */}
            <h2 className={styles.sectionTitle}>Todas las skills evaluadas</h2>
            <div className={styles.list}>
              {sorted.map(skill => {
                const pct = Math.round(skill.mastery * 100)
                const isLow = skill.mastery < 0.4
                const lastDate = skill.lastUpdate
                  ? new Date(skill.lastUpdate).toLocaleDateString('es', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })
                  : '—'

                return (
                  <div
                    key={skill.skillId}
                    className={`${styles.skillCard} ${isLow ? styles.lowMastery : ''}`}
                  >
                    <div className={styles.skillInfo}>
                      <p className={styles.skillName}>{skill.skillName}</p>
                      {skill.domainName && (
                        <p className={styles.skillDomain}>{skill.domainName}</p>
                      )}
                    </div>

                    <div className={styles.progressWrapper}>
                      <div className={styles.progressRow}>
                        <div className={styles.progressBar}>
                          <div
                            className={`${styles.progressFill} ${getFillClass(skill.mastery, styles)}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className={styles.progressPct}>{pct}%</span>
                      </div>
                      <span className={styles.progressMeta}>
                        {skill.attempts} evaluación{skill.attempts !== 1 ? 'es' : ''}
                      </span>
                    </div>

                    <span
                      className={styles.trend}
                      style={{ color: getTrendColor((skill as never as { trend?: string }).trend) }}
                      title={(skill as never as { trend?: string }).trend ?? 'stable'}
                    >
                      {getTrendIcon((skill as never as { trend?: string }).trend)}
                    </span>

                    <div className={styles.skillMeta}>
                      <p className={styles.lastEval}>Última eval.</p>
                      <p className={styles.attempts}>{lastDate}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
