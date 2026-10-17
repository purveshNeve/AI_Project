import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import PageContainer from '../components/layout/PageContainer'
import AnalysisTable from '../components/history/AnalysisTable'
import Button from '../components/common/Button'
import Badge from '../components/common/Badge'
import { analysisService } from '../services/analysisService'
import type { CandidateResume } from '../types/resume'
import { Search, Filter, Plus, Sparkles } from 'lucide-react'

export default function History() {
  const [searchParams] = useSearchParams()
  const [resumes, setResumes] = useState<CandidateResume[]>([])
  const [filteredResumes, setFilteredResumes] = useState<CandidateResume[]>([])

  const initialQuery = searchParams.get('search') || ''
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [selectedStatus, setSelectedStatus] = useState<string>('all')

  useEffect(() => {
    async function loadResumes() {
      try {
        const data = await analysisService.getAllResumes()
        setResumes(data)
      } catch (err) {
        console.error('Failed to load resumes', err)
      }
    }
    loadResumes()
  }, [])

  useEffect(() => {
    let result = [...resumes]

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (r) =>
          r.candidateName.toLowerCase().includes(q) ||
          r.jobTitle.toLowerCase().includes(q) ||
          r.skills.some((s) => s.toLowerCase().includes(q))
      )
    }

    if (selectedStatus !== 'all') {
      result = result.filter((r) => r.status === selectedStatus)
    }

    setFilteredResumes(result)
  }, [resumes, searchQuery, selectedStatus])

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete candidate resume profile?')) {
      await analysisService.deleteResume(id)
      setResumes((prev) => prev.filter((r) => r.id !== id))
    }
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              Candidate Resumes History
            </h1>
            <Badge variant="ai" icon={<Sparkles className="h-3 w-3 text-purple-600" />}>
              {filteredResumes.length} Records
            </Badge>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Search, filter, and inspect all AI-parsed candidate profiles.
          </p>
        </div>

        <Link to="/upload">
          <Button variant="primary" size="md">
            <Plus className="h-4 w-4" />
            <span>Upload Resume</span>
          </Button>
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter candidates by name, skills, or job title..."
            className="w-full h-9 pl-10 pr-4 rounded-xl border border-slate-200 bg-slate-50/70 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" />
            Status:
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'parsed', label: 'Parsed' },
            { id: 'processing', label: 'Processing' },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setSelectedStatus(st.id)}
              className={[
                'px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer',
                selectedStatus === st.id
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <AnalysisTable resumes={filteredResumes} onDelete={handleDelete} />
    </PageContainer>
  )
}
