//
//  ProgressChart.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import type { TooltipItem } from 'chart.js'
import { type ProgressData } from '../../../services/stats/statsService'
import styles from './ProgressChart.module.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface ProgressChartProps {
  data: ProgressData[]
}

export function ProgressChart({ data }: ProgressChartProps) {
  const chartData = {
    labels: data.map(d => d.category),
    datasets: [
      {
        label: 'Completado',
        data: data.map(d => d.completed),
        backgroundColor: '#10b981',
        borderRadius: 4,
        barPercentage: 0.6,
      },
      {
        label: 'Pendiente',
        data: data.map(d => d.total - d.completed),
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        barPercentage: 0.6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          color: '#374151',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        callbacks: {
          label: (context: TooltipItem<'bar'>) => {
            const label = context.dataset.label || ''
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const value = (context.parsed as any).y ?? 0
            return `${label}: ${value} cursos`
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: '#e5e7eb',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
          stepSize: 1,
        },
      },
    },
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Progreso por categoría</h3>
      <div className={styles.chart}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}
