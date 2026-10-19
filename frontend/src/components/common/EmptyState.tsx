import type { ReactNode } from 'react'

export interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
  className?: string
}

export default function EmptyState({
  title,
  description,
  icon,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <section
      className={[
        'flex flex-col items-center justify-center rounded-xl border border-dashed border-[#DED4CA] px-6 py-12 text-center bg-[#F7F3EE]',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && <div className="mb-4 text-[#A08C81]">{icon}</div>}
      <h2 className="text-base font-semibold text-[#2F241F]">{title}</h2>
      {description && (
        <p className="mt-2 max-w-md text-sm text-[#75685F]">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </section>
  )
}
