//
//  FavoritesPage.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getStoredAccessToken } from '../../services/auth/authService'
import { bookmarksService, type Bookmark } from '../../services/bookmarks'
import { ContentCard } from '../contents/components'
import styles from './FavoritesPage.module.css'

export function FavoritesPage() {
  const navigate = useNavigate()
  const token = getStoredAccessToken()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    loadBookmarks()
  }, [token, navigate])

  const loadBookmarks = async () => {
    try {
      const userId = 'user-1' // TODO: Get from auth service
      const data = await bookmarksService.getBookmarks(userId)
      setBookmarks(data)
    } catch (error) {
      console.error('Error loading bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContentClick = (contentId: string) => {
    navigate(`/contents/${contentId}`)
  }

  const handleRemoveBookmark = async (contentId: string) => {
    try {
      const userId = 'user-1' // TODO: Get from auth service
      await bookmarksService.removeBookmark(userId, contentId)
      setBookmarks(bookmarks.filter(b => b.contentId !== contentId))
    } catch (error) {
      console.error('Error removing bookmark:', error)
    }
  }

  const filteredBookmarks = bookmarks.filter(bookmark =>
    bookmark.content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.content.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bookmark.content.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  )

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
          <p style={{ color: '#64748b' }}>Cargando favoritos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.title}>Mis Favoritos</h1>
            <p className={styles.subtitle}>
              {bookmarks.length} {bookmarks.length === 1 ? 'contenido guardado' : 'contenidos guardados'}
            </p>
          </div>
          <button 
            onClick={() => navigate('/contents')}
            className={styles.backButton}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a contenidos
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.searchSection}>
          <input
            type="text"
            placeholder="Buscar en favoritos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        {filteredBookmarks.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </div>
            <h3>
              {searchQuery ? 'No hay resultados' : 'No tienes favoritos'}
            </h3>
            <p>
              {searchQuery 
                ? 'Prueba con otra búsqueda'
                : 'Guarda contenido para verlo aquí'
              }
            </p>
            {!searchQuery && (
              <button 
                onClick={() => navigate('/contents')}
                className={styles.browseButton}
              >
                Explorar contenidos
              </button>
            )}
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredBookmarks.map((bookmark) => (
              <div key={bookmark.id} className={styles.bookmarkCard}>
                <ContentCard
                  content={bookmark.content}
                  onClick={() => handleContentClick(bookmark.contentId)}
                />
                <button
                  onClick={() => handleRemoveBookmark(bookmark.contentId)}
                  className={styles.removeButton}
                  title="Quitar de favoritos"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
