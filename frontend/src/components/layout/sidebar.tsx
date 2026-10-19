import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  BarChart3,
  Settings,
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
    <aside className="w-64 shrink-0 border-r border-[#DED4CA] bg-[#FCFAF7] min-h-[calc(100vh-4rem)] flex flex-col justify-between p-4">
      <div className="space-y-1">
        {/* Section label */}
        <div className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-wider text-[#A08C81]">
          Navigation
        </div>

        {/* Nav Items */}
        <nav className="space-y-0.5">
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
                  'group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-[#E9DFD5] text-[#4A3023] font-semibold'
                    : 'text-[#75685F] hover:bg-[#EFE8DF] hover:text-[#2F241F]',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={[
                      'h-4 w-4 transition-colors',
                      isActive
                        ? 'text-[#8B5E3C]'
                        : 'text-[#A08C81] group-hover:text-[#75685F]',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge ? (
                  <span className="rounded-full bg-[#8B5E3C] px-2 py-0.5 text-[10px] font-semibold text-white">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="border-t border-[#DED4CA] pt-3 px-2 mt-4">
        <div className="flex items-center justify-between text-xs text-[#A08C81]">
          <span className="font-medium">Resume Analyzer</span>
          <span className="text-[10px]">v2.4</span>
        </div>
      </div>
    </aside>
  )
}
