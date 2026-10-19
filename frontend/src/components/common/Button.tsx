import type { ButtonHTMLAttributes } from 'react'
import LoadingSpinner from './LoadingSpinner'

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#8B5E3C] hover:bg-[#7a5235] text-white shadow-xs hover:shadow-sm active:scale-[0.99] border border-transparent',
  secondary:
    'bg-[#FCFAF7] text-[#2F241F] border border-[#DED4CA] hover:bg-[#E9DFD5] hover:border-[#C4B5A8] shadow-2xs active:scale-[0.99]',
  outline:
    'border border-[#DED4CA] bg-[#F7F3EE] text-[#8B5E3C] hover:bg-[#E9DFD5] hover:border-[#C4B5A8] focus-visible:ring-[#8B5E3C]',
  ghost:
    'bg-transparent text-[#75685F] hover:bg-[#E9DFD5] hover:text-[#2F241F] focus-visible:ring-[#C4B5A8]',
  danger:
    'bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100 hover:text-rose-800 focus-visible:ring-rose-500',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs font-medium rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm font-medium rounded-lg gap-2',
  lg: 'h-11 px-5 text-sm font-semibold rounded-lg gap-2.5',
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  type = 'button',
  children,
  ...props
}: ButtonProps) {
  const classes = [
    'inline-flex items-center justify-center font-sans tracking-tight transition-all duration-150 cursor-pointer select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B5E3C]/30 focus-visible:ring-offset-1',
    'disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none',
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      {...props}
      type={type}
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
    >
      {loading && <LoadingSpinner size="sm" color={variant === 'primary' ? 'white' : 'brown'} label="Loading" />}
      {children}
    </button>
  )
}
