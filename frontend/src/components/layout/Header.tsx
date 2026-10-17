import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles, UploadCloud, Search, Zap, FileText } from 'lucide-react'
import Button from '../common/Button'
import Badge from '../common/Badge'

export default function Header() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/history?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur-md transition-all">
      {/* Left Branding */}
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white shadow-xs group-hover:shadow-md transition-all">
            <Sparkles className="h-5 w-5 animate-pulse-subtle" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold tracking-tight text-slate-900 group-hover:text-purple-600 transition-colors">
              Resume Parser
            </span>
            <span className="text-[10px] font-medium tracking-wide text-slate-600 uppercase">
              AI Intelligence
            </span>
          </div>
        </Link>
        <Badge variant="ai" className="hidden sm:inline-flex">
          <Zap className="h-3 w-3 text-purple-600" />
          v2.4 Engine
        </Badge>
      </div>

      {/* Center Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidates, skills, or job titles..."
            className="w-full h-9 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all"
          />
        </div>
      </form>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <Link to="/history" className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100">
          <FileText className="h-4 w-4 text-purple-600" />
          <span>Resumes</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2 rounded-xl bg-slate-100/80 px-3 py-1.5 border border-slate-200/60 text-xs">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-slate-600 font-medium">System Ready</span>
        </div>

        <Link to="/upload">
          <Button variant="primary" size="sm">
            <UploadCloud className="h-4 w-4" />
            <span>Upload Resume</span>
          </Button>
        </Link>
      </div>
    </header>
  )
}
