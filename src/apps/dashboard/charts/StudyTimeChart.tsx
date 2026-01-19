//
//  StudyTimeChart.tsx
//  TFM Frontend
//
//  Created by Victor Sanchez on Jan 18, 2026.
//  Copyright © 2026 Victor Sanchez. All rights reserved.
//

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { TooltipItem } from 'chart.js'
import { type StudyTimeData } from '../../../services/stats/statsService'
import styles from './StudyTimeChart.module.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface StudyTimeChartProps {
  data: StudyTimeData[]
}

export function StudyTimeChart({ data }: StudyTimeChartProps) {
  const chartData = {
    labels: data.map(d => {
      const date = new Date(d.date)
      return date.toLocaleDateString('es', { day: 'numeric', month: 'short' })
    }),
    datasets: [
      {
        label: 'Minutos de estudio',
        data: data.map(d => d.minutes),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: '#3b82f6',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const minutes = (context.parsed as any).y ?? 0
            const hours = Math.floor(minutes / 60)
            const mins = minutes % 60
            return `${hours}h ${mins}m`
          },
        },
      },
    },
    scales: {
      x: {
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
        beginAtZero: true,
        grid: {
          color: '#e5e7eb',
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 12,
          },
          callback: (value: string | number) => {
            const numValue = typeof value === 'string' ? parseInt(value) : value
            const hours = Math.floor(numValue / 60)
            const mins = numValue % 60
            return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
          },
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Tiempo de estudio diario</h3>
      <div className={styles.chart}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}
