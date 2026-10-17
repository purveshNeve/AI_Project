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
    'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500 hover:from-purple-700 hover:via-indigo-700 hover:to-pink-600 text-white shadow-xs hover:shadow-md active:scale-[0.99] border border-transparent',
  secondary:
    'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 shadow-2xs active:scale-[0.99]',
  outline:
    'border border-purple-200 bg-purple-50/40 text-purple-700 hover:bg-purple-50 hover:border-purple-300 focus-visible:ring-purple-500',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 focus-visible:ring-slate-400',
  danger:
    'bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100 hover:text-rose-800 focus-visible:ring-rose-500',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs font-medium rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm font-medium rounded-xl gap-2',
  lg: 'h-11 px-5 text-sm font-semibold rounded-xl gap-2.5',
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
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/40 focus-visible:ring-offset-1',
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
      {loading && <LoadingSpinner size="sm" color={variant === 'primary' ? 'white' : 'purple'} label="Loading" />}
      {children}
    </button>
  )
}
