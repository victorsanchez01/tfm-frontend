//
//  HomePage.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import { useTheme } from '@shared/providers/useTheme'

export function HomePage() {
  const { theme, toggleTheme } = useTheme()
  return (
    <div style={{ padding: '2rem' }}>
      <h1>TFM Frontend</h1>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle theme</button>
    </div>
  )
}
