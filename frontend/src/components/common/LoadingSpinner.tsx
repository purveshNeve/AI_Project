import type { HTMLAttributes } from 'react'

export type LoadingSpinnerSize = 'sm' | 'md' | 'lg' | 'xl'

export interface LoadingSpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: LoadingSpinnerSize
  label?: string
  color?: 'brown' | 'white' | 'purple'
}

const sizeClasses: Record<LoadingSpinnerSize, string> = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-3',
  xl: 'h-14 w-14 border-4',
}

export default function LoadingSpinner({
  size = 'md',
  label = 'Loading',
  color = 'brown',
  className = '',
  ...props
}: LoadingSpinnerProps) {
  const borderColors = {
    brown:  'border-[#DED4CA] border-t-[#8B5E3C] border-r-[#A08C81]',
    white:  'border-white/30 border-t-white border-r-white/80',
    purple: 'border-[#DED4CA] border-t-[#8B5E3C] border-r-[#A08C81]',
  }

  return (
    <div
      {...props}
      role="status"
      aria-label={label}
      className={[
        'inline-flex items-center justify-center',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span
        className={[
          'inline-block shrink-0 animate-spin rounded-full transition-all',
          sizeClasses[size],
          borderColors[color],
        ]
          .filter(Boolean)
          .join(' ')}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}
