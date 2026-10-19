export interface MatchTier {
  label: string
  color: string
  bg: string
  border: string
  badgeVariant: 'success' | 'primary' | 'warning' | 'danger'
}

export function formatScoreTier(score: number): MatchTier {
  if (score >= 90) {
    return {
      label: 'High Match',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      badgeVariant: 'success',
    }
  }
  if (score >= 75) {
    return {
      label: 'Good Match',
      color: 'text-[#6B4632]',
      bg: 'bg-[#F5EFE6]',
      border: 'border-[#D8C8BB]',
      badgeVariant: 'primary',
    }
  }
  if (score >= 60) {
    return {
      label: 'Moderate Match',
      color: 'text-amber-700',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badgeVariant: 'warning',
    }
  }
  return {
    label: 'Low Match',
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    badgeVariant: 'danger',
  }
}
