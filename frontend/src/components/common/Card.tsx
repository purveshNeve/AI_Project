import type { HTMLAttributes } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hoverEffect?: boolean
  gradientBorder?: boolean
}

export default function Card({
  hoverEffect = false,
  gradientBorder = false,
  className = '',
  children,
  ...props
}: CardProps) {
  return (
    <div
      {...props}
      className={[
        'rounded-2xl border bg-white p-5 text-slate-900 shadow-2xs transition-all duration-200',
        gradientBorder ? 'border-purple-200/80 bg-gradient-to-b from-white via-white to-purple-50/20' : 'border-slate-200/80',
        hoverEffect ? 'hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
