//
//  useTheme.ts
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright 2026 Victor Sanchez. All rights reserved.
//

import { useContext } from 'react'
import { ThemeContext } from './ThemeContext'

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider')
  }
  return context
}
