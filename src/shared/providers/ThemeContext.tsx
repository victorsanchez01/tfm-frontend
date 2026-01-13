//
//  ThemeContext.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { createContext } from 'react'

export type Theme = 'light' | 'dark'

export type ThemeContextValue = {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)
