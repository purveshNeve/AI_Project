import type { RiskLevel } from '../types/resume'

export function getRiskBadgeStyle(level: RiskLevel) {
  switch (level) {
    case 'high':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        label: 'High Attention'
      }
    case 'medium':
      return {
        bg: 'bg-amber-50 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        label: 'Medium Note'
      }
    case 'low':
    default:
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Low Risk'
      }
  }
}
