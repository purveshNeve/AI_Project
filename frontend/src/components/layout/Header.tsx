import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { UploadCloud, Search, FileText, BrainCircuit } from 'lucide-react'
import Button from '../common/Button'

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
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#DED4CA] bg-[#FCFAF7]/95 px-6 backdrop-blur-sm transition-all">
      {/* Left Branding */}
      <div className="flex items-center gap-3">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#8B5E3C] text-white transition-all group-hover:bg-[#7a5235]">
            <BrainCircuit className="h-4.5 w-4.5" style={{ width: '18px', height: '18px' }} />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-[#2F241F] group-hover:text-[#8B5E3C] transition-colors">
              Resume Analyzer
            </span>
            <span className="text-[10px] font-medium tracking-wide text-[#A08C81] uppercase">
              AI Recruitment
            </span>
          </div>
        </Link>
      </div>

      {/* Center Search Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A08C81]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidates, skills, or job titles..."
            className="w-full h-9 pl-10 pr-4 rounded-lg border border-[#DED4CA] bg-[#F7F3EE] text-xs text-[#2F241F] placeholder-[#A08C81] focus:bg-[#FCFAF7] focus:border-[#8B5E3C] focus:outline-none focus:ring-2 focus:ring-[#8B5E3C]/15 transition-all"
          />
        </div>
      </form>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        <Link to="/history" className="hidden lg:flex items-center gap-1.5 text-xs font-medium text-[#75685F] hover:text-[#2F241F] transition-colors px-2.5 py-1.5 rounded-lg hover:bg-[#E9DFD5]">
          <FileText className="h-4 w-4 text-[#8B5E3C]" />
          <span>Resumes</span>
        </Link>

        <div className="hidden sm:flex items-center gap-2 rounded-lg bg-[#EFE8DF] px-3 py-1.5 border border-[#DED4CA] text-xs">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-[#75685F] font-medium">System Ready</span>
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
