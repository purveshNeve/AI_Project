import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import PageContainer from '../components/layout/PageContainer'
import OverallScore from '../components/analysis/OverallScore'
import SkillMatch from '../components/analysis/SkillMatch'
import RiskAnalysis from '../components/analysis/RiskAnalysis'
import Recommendations from '../components/analysis/Recommendations'
import EvidenceCard from '../components/analysis/EvidenceCard'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { analysisService } from '../services/analysisService'
import type { CandidateResume } from '../types/resume'
import {
  ArrowLeft,
  Sparkles,
  Mail,
  Phone,
  MapPin,
  Download,
  Trash2,
  Globe
} from 'lucide-react'

export default function AnalysisResult() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [candidate, setCandidate] = useState<CandidateResume | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCandidate() {
      setLoading(true)
      try {
        const found = id ? await analysisService.getResume(id) : undefined
        setCandidate(found || null)
      } catch (err) {
        console.error('Failed to load candidate', err)
      } finally {
        setLoading(false)
      }
    }
    loadCandidate()
  }, [id])

  const handleDelete = async () => {
    if (candidate && window.confirm(`Are you sure you want to delete ${candidate.candidateName}?`)) {
      await analysisService.deleteResume(candidate.id)
      navigate('/history')
    }
  }

  if (loading) {
    return (
      <PageContainer>
        <div className="py-24 text-center">
          <LoadingSpinner size="lg" color="brown" label="Loading candidate intelligence..." />
          <p className="text-xs text-slate-500 mt-3 font-medium">Fetching the saved candidate profile...</p>
        </div>
      </PageContainer>
    )
  }

  if (!candidate) {
    return (
      <PageContainer>
        <div className="py-16 text-center">
          <h2 className="text-lg font-bold text-slate-900">Candidate profile not found</h2>
          <Link to="/history" className="inline-block mt-4">
            <Button variant="primary" size="md">
              Return to Resumes
            </Button>
          </Link>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      {/* Top Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/history')}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 font-sans">
                {candidate.candidateName}
              </h1>
              <Badge variant="ai" icon={<Sparkles className="h-3 w-3 text-[#6F4E37]" />}>
                AI Profile
              </Badge>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {candidate.jobTitle} • Extracted from {candidate.fileName}
            </p>
          </div>
        </div>

        {/* Actions Header */}
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => alert('JSON exported to clipboard')}>
            <Download className="h-4 w-4" />
            <span>Export JSON</span>
          </Button>
          <Button variant="danger" size="sm" onClick={handleDelete}>
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Candidate Details & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          {/* Candidate Overview Card */}
          <Card className="p-6 border-slate-200/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#6B4632] via-[#8B5E3C] to-[#B08968] text-white font-extrabold text-xl shadow-md">
                  {candidate.candidateName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{candidate.candidateName}</h2>
                  <div className="text-xs font-semibold text-[#6B4632] mt-0.5">{candidate.jobTitle}</div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {candidate.location}
                    </span>
                    <span>•</span>
                    <span>
                      {candidate.experienceYears != null
                        ? `${candidate.experienceYears} Years Exp.`
                        : 'Experience not specified'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 bg-[#F5EFE6]/60 p-3 rounded-xl border border-[#E5D8CE]">
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Resume Status
                </span>
                <span className="text-sm font-extrabold text-[#6B4632]">
                  {candidate.status === 'parsed' ? 'Parsed' : candidate.status}
                </span>
              </div>
            </div>

            {/* Contact Info Pills */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mb-5">
              {candidate.email && (
                <a
                  href={`mailto:${candidate.email}`}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 border border-slate-200/60 hover:bg-slate-100 transition-colors"
                >
                  <Mail className="h-3.5 w-3.5 text-[#8B5E3C]" />
                  <span>{candidate.email}</span>
                </a>
              )}
              {candidate.phone && (
                <div className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 border border-slate-200/60">
                  <Phone className="h-3.5 w-3.5 text-[#8B5E3C]" />
                  <span>{candidate.phone}</span>
                </div>
              )}
              {candidate.linkedin && (
                <a
                  href={`https://${candidate.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 rounded-lg bg-slate-50 px-3 py-1.5 border border-slate-200/60 hover:bg-slate-100 transition-colors"
                >
                  <Globe className="h-3.5 w-3.5 text-[#8B5E3C]" />
                  <span>{candidate.linkedin}</span>
                </a>
              )}
            </div>

            {/* Candidate Executive Summary */}
            {candidate.summary && (
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  AI Extracted Profile Summary
                </h4>
                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                  {candidate.summary}
                </p>
              </div>
            )}
          </Card>

          {/* Skill Matching Section */}
          <SkillMatch
            skills={candidate.skills}
            matchedSkills={candidate.matchedSkills}
            missingSkills={candidate.missingSkills}
          />

          {/* Work History & Education Timeline */}
          <EvidenceCard workHistory={candidate.workHistory} education={candidate.education} />
        </div>

        {/* Right Column: AI Score Gauge, Risk & Recommendations */}
        <div className="space-y-6">
          <OverallScore score={candidate.overallScore} confidenceScore={candidate.confidenceScore} />

          <Recommendations insights={candidate.aiInsights} />

          <RiskAnalysis signals={candidate.riskSignals} />
        </div>
      </div>
    </PageContainer>
  )
}
