import type { ReactNode } from 'react'
import Card from '../common/Card'
import { TrendingUp, TrendingDown } from 'lucide-react'

export interface StatsCardProps {
  title: string
  value: string | number
  icon: ReactNode
  trend?: string
  trendUp?: boolean
  description?: string
  accentColor?: string
}

export default function StatsCard({
  title,
  value,
  icon,
  trend,
  trendUp = true,
  description,
}: StatsCardProps) {
  return (
    <Card hoverEffect className="relative overflow-hidden group border-slate-200/80">
      <div className="flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100 group-hover:bg-gradient-to-tr group-hover:from-purple-600 group-hover:to-pink-500 group-hover:text-white transition-all duration-300">
          {icon}
        </div>

        {trend && (
          <div
            className={[
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
              trendUp
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                : 'bg-rose-50 text-rose-700 border border-rose-200/60',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            <span>{trend}</span>
          </div>
        )}
      </div>

      <div className="mt-4">
        <div className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
          {value}
        </div>
        <div className="text-xs font-medium text-slate-600 mt-1">{title}</div>
        {description && (
          <div className="text-[11px] text-slate-400 mt-0.5">{description}</div>
        )}
      </div>

      {/* Decorative gradient highlight line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Card>
  )
}
