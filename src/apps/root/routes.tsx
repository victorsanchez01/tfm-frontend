//
//  routes.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { Routes, Route } from 'react-router-dom'
import { HomePage } from './HomePage'
import { RegisterPage, LoginPage } from '../auth'
import { DashboardPage } from '../dashboard'
import { ProfilePage } from '../profile'
import { GoalsPage } from '../goals'
import { ContentsPage, ContentDetailPage } from '../contents'
import { FavoritesPage } from '../favorites'
import { StatsPage } from '../stats'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/goals" element={<GoalsPage />} />
      <Route path="/contents" element={<ContentsPage />} />
      <Route path="/contents/:id" element={<ContentDetailPage />} />
      <Route path="/favorites" element={<FavoritesPage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/home" element={<HomePage />} />
    </Routes>
  )
}
