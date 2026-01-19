//
//  DashboardCard.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 12, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import type { ReactNode } from 'react'
import { Button } from '@shared/ui'
import styles from './DashboardCard.module.css'

interface DashboardCardProps {
  icon: ReactNode
  iconColor: 'blue' | 'emerald' | 'violet' | 'red' | 'orange' | 'pink' | 'yellow'
  title: string
  description: string
  buttonText: string
  onButtonClick: () => void
}

export function DashboardCard({
  icon,
  iconColor,
  title,
  description,
  buttonText,
  onButtonClick,
}: DashboardCardProps) {
  const getIconClass = () => {
    switch (iconColor) {
      case 'blue':
        return styles.iconBlue
      case 'emerald':
        return styles.iconEmerald
      case 'violet':
        return styles.iconViolet
      case 'red':
        return styles.iconRed
      case 'orange':
        return styles.iconOrange
      case 'pink':
        return styles.iconPink
      case 'yellow':
        return styles.iconYellow
      default:
        return styles.iconBlue
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={`${styles.cardIcon} ${getIconClass()}`}>
          {icon}
        </div>
        <h3 className={styles.cardTitle}>{title}</h3>
      </div>
      <p className={styles.cardDescription}>{description}</p>
      <Button variant="secondary" onClick={onButtonClick}>
        {buttonText}
      </Button>
    </div>
  )
}
