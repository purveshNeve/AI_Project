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
        'rounded-xl border bg-[#FCFAF7] p-5 text-[#2F241F] shadow-xs transition-all duration-200',
        gradientBorder ? 'border-[#C4B5A8]' : 'border-[#DED4CA]',
        hoverEffect ? 'hover:-translate-y-0.5 hover:border-[#C4B5A8] hover:shadow-sm' : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {children}
    </div>
  )
}
