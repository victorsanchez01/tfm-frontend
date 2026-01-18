//
//  ContentsPage.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '@shared/ui'
import { getStoredAccessToken } from '../../services/auth/authService'
import { contentsService, type Content } from '../../services/contents/contentsService'
import { ContentGrid, FilterBar } from './components'
import styles from './ContentsPage.module.css'

export function ContentsPage() {
  const navigate = useNavigate()
  const token = getStoredAccessToken()
  const [contents, setContents] = useState<Content[]>([])
  const [filteredContents, setFilteredContents] = useState<Content[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState('all')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    loadContents()
  }, [token, navigate])

  useEffect(() => {
    filterContents()
  }, [contents, searchQuery, selectedCategory, selectedLevel])

  const loadContents = async () => {
    try {
      const data = await contentsService.getContents()
      setContents(data)
    } catch (error) {
      console.error('Error loading contents:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterContents = () => {
    let filtered = [...contents]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(content =>
        content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(content => content.category === selectedCategory)
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(content => content.level === selectedLevel)
    }

    setFilteredContents(filtered)
  }

  const handleContentClick = (content: Content) => {
    navigate(`/contents/${content.id}`)
  }

  const getCategories = () => {
    const categories = Array.from(new Set(contents.map(c => c.category)))
    return ['all', ...categories]
  }

  const getLevels = () => {
    return ['all', 'beginner', 'intermediate', 'advanced']
  }

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
          <p style={{ color: '#64748b' }}>Cargando contenidos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Catálogo de Contenidos</h1>
          <Button variant="secondary" onClick={() => navigate('/dashboard')}>
            Volver al dashboard
          </Button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.searchSection}>
          <Input
            placeholder="Buscar contenidos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <FilterBar
          categories={getCategories()}
          levels={getLevels()}
          selectedCategory={selectedCategory}
          selectedLevel={selectedLevel}
          onCategoryChange={setSelectedCategory}
          onLevelChange={setSelectedLevel}
        />

        <div className={styles.results}>
          <p className={styles.resultsCount}>
            {filteredContents.length} {filteredContents.length === 1 ? 'contenido encontrado' : 'contenidos encontrados'}
          </p>
        </div>

        <ContentGrid
          contents={filteredContents}
          onContentClick={handleContentClick}
        />
      </main>
    </div>
  )
}
