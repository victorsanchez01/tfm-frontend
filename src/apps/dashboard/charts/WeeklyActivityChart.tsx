//
//  WeeklyActivityChart.tsx
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
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { type ActivityData } from '../../../services/stats/statsService'
import styles from './WeeklyActivityChart.module.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip
)

interface WeeklyActivityChartProps {
  data: ActivityData[]
}

export function WeeklyActivityChart({ data }: WeeklyActivityChartProps) {
  const chartData = {
    labels: data.map(d => d.date),
    datasets: [
      {
        label: 'Actividades',
        data: data.map(d => d.activities),
        backgroundColor: '#8b5cf6',
        borderRadius: 4,
        barPercentage: 0.5,
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
        borderColor: '#8b5cf6',
        borderWidth: 1,
        displayColors: false,
        callbacks: {
          label: (context: { parsed: { y: number } }) => {
            const activities = context.parsed.y
            return `${activities} ${activities === 1 ? 'actividad' : 'actividades'}`
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
          stepSize: 2,
        },
      },
    },
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Actividad semanal</h3>
      <div className={styles.chart}>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  )
}
