import type { HTMLAttributes } from 'react'

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  value?: number
  max?: number
  label?: string
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  gradient?: boolean
}

export default function ProgressBar({
  value,
  max = 100,
  label = 'Progress',
  showValue = false,
  size = 'md',
  gradient = true,
  className = '',
  ...props
}: ProgressBarProps) {
  const boundedMax = Number.isFinite(max) && max > 0 ? max : 100
  const boundedValue =
    value === undefined || !Number.isFinite(value)
      ? undefined
      : Math.min(Math.max(value, 0), boundedMax)
  const percentage =
    boundedValue === undefined ? undefined : (boundedValue / boundedMax) * 100

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-[#75685F]">
          <span>{label}</span>
          {showValue && <span>{percentage !== undefined ? `${Math.round(percentage)}%` : '--'}</span>}
        </div>
      )}
      <div
        {...props}
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={boundedMax}
        aria-valuenow={boundedValue}
        className={[
          'w-full overflow-hidden rounded-full bg-[#EFE8DF] border border-[#DED4CA]',
          heightClasses[size],
          className,
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <div
          className={[
            'h-full rounded-full transition-all duration-500 ease-out',
            gradient
              ? 'bg-[#8B5E3C]'
              : 'bg-[#8B5E3C]',
            percentage === undefined ? 'w-1/3 animate-pulse' : '',
          ]
            .filter(Boolean)
            .join(' ')}
          style={percentage === undefined ? undefined : { width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
