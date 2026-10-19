import type { HTMLAttributes, ReactNode } from 'react'

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'gradient' | 'ai'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
  icon?: ReactNode
}

const variantClasses: Record<BadgeVariant, string> = {
  default:  'bg-[#EFE8DF] text-[#75685F] border-[#DED4CA]',
  primary:  'bg-[#F0E6DC] text-[#8B5E3C] border-[#DED4CA]',
  success:  'bg-emerald-50 text-emerald-700 border-emerald-200/70',
  warning:  'bg-amber-50 text-amber-800 border-amber-200/70',
  danger:   'bg-rose-50 text-rose-700 border-rose-200/70',
  gradient: 'bg-[#8B5E3C] text-white border-transparent shadow-2xs',
  ai:       'bg-[#F0E6DC] text-[#8B5E3C] border-[#DED4CA]',
}

const dotColors: Record<BadgeVariant, string> = {
  default:  'bg-[#A08C81]',
  primary:  'bg-[#8B5E3C]',
  success:  'bg-emerald-500',
  warning:  'bg-amber-500',
  danger:   'bg-rose-500',
  gradient: 'bg-white',
  ai:       'bg-[#8B5E3C]',
}

export default function Badge({
  variant = 'default',
  dot = false,
  icon,
  className = '',
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={[
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium tracking-tight transition-colors',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`} />}
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  )
}
