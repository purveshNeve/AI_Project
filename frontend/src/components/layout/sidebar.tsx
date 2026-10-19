import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  BarChart3,
  Settings,
  BrainCircuit,
  ChevronRight,
  Users,
} from 'lucide-react'

export interface NavItem {
  name: string
  path: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const navItems: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Upload & Parse', path: '/new-analysis', icon: UploadCloud, badge: 'New' },
  { name: 'Batch Analysis', path: '/batch-analysis', icon: Users },
  { name: 'All Resumes', path: '/history', icon: FileText },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Settings', path: '/settings', icon: Settings },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200/80 bg-white min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4 selection:bg-purple-100">
      <div className="space-y-6">
        {/* Navigation Group */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Main Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive =
                item.path === '/'
                  ? location.pathname === '/' || location.pathname === '/dashboard'
                  : location.pathname.startsWith(item.path)

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={[
                    'group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-purple-50/90 text-purple-700 font-semibold border-r-3 border-purple-600 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={[
                        'h-4 w-4 transition-colors',
                        isActive
                          ? 'text-purple-600'
                          : 'text-slate-400 group-hover:text-slate-600',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge ? (
                    <span className="rounded-full bg-gradient-to-r from-purple-600 to-pink-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="h-4 w-4 text-purple-600" />
                  ) : null}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* AI Features Highlight Box */}
        <div className="rounded-2xl border border-purple-100 bg-gradient-to-b from-purple-50/60 to-pink-50/30 p-4 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600 text-white shadow-xs">
              <BrainCircuit className="h-4 w-4" />
            </div>
            <span className="text-xs font-bold text-purple-900">AI Neural Engine</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed mb-3">
            Instant candidate extraction, skill matching & risk verification powered by AI.
          </p>
          <div className="flex items-center justify-between text-[11px] font-semibold text-purple-700">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              98.6% Accuracy
            </span>
            <span className="text-slate-400">v2.4</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-100 pt-3 px-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Resume Parser AI</span>
          <span className="font-mono text-[10px]">PRO SaaS</span>
        </div>
      </div>
    </aside>
  )
}
