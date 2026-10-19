import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageContainer from '../components/layout/PageContainer'
import StatsCard from '../components/dashboard/StatsCard'
import RecentAnalysis from '../components/dashboard/RecentAnalysis'
import ResumeUploader from '../components/analysis/ResumeUploader'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import { analysisService } from '../services/analysisService'
import type { CandidateResume, AnalysisStats } from '../types/resume'
import {
  Sparkles,
  FileText,
  CheckCircle2,
  Clock,
  Award,
  Zap,
  BrainCircuit,
  Plus
} from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<AnalysisStats | null>(null)
  const [recentResumes, setRecentResumes] = useState<CandidateResume[]>([])
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    async function loadData() {
      try {
        const data = await analysisService.getDashboardData()
        setStats(data.stats)
        setRecentResumes(data.recentResumes)
      } catch (err) {
        console.error('Failed to load dashboard data', err)
        setLoadError('Dashboard data could not be loaded. Please refresh to try again.')
      }
    }
    loadData()
  }, [])

  const handleQuickUpload = async (file: File) => {
    try {
      const parsed = await analysisService.parseResume(file)
      navigate(`/analysis/${parsed.id}`)
    } catch (err) {
      console.error('Upload failed', err)
    }
  }

  return (
    <PageContainer>
      {/* Dashboard Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
              Resume Parser
            </h1>
            <Badge variant="ai" icon={<Sparkles className="h-3.5 w-3.5 text-purple-600" />}>
              AI Platform
            </Badge>
          </div>
          <p className="text-sm text-slate-600">
            AI-powered resume parsing and candidate intelligence.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/history">
            <Button variant="secondary" size="md">
              <FileText className="h-4 w-4" />
              <span>All Resumes</span>
            </Button>
          </Link>
          <Link to="/new-analysis">
            <Button variant="primary" size="md">
              <Plus className="h-4 w-4" />
              <span>New Analysis</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Statistic Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Resumes Parsed"
          value={stats ? stats.totalResumes.toLocaleString() : '—'}
          icon={<FileText className="h-5 w-5" />}
          description="Saved resume records"
        />
        <StatsCard
          title="Successfully Parsed"
          value={stats ? stats.successfullyParsed.toLocaleString() : '—'}
          icon={<CheckCircle2 className="h-5 w-5" />}
          description="Successfully parsed resumes"
        />
        <StatsCard
          title="Avg. AI Match Score"
          value={stats?.avgMatchScore != null ? `${stats.avgMatchScore}%` : 'Not analyzed'}
          icon={<Award className="h-5 w-5" />}
          description="Scores require a job description"
        />
        <StatsCard
          title="Active Processing"
          value={stats ? stats.processingCount : '—'}
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Analysis & Hero Upload Card */}
        <div className="lg:col-span-2 space-y-8">
          {loadError && (
            <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
              {loadError}
            </p>
          )}
          <RecentAnalysis resumes={recentResumes} />

          {/* Quick Drag & Drop Section */}
          <Card className="p-6 border-purple-200/80 bg-gradient-to-b from-white via-white to-purple-50/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-600" />
                  <span>Quick Resume Upload</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Drag any PDF or Word resume for instant parsing</p>
              </div>
            </div>
            <ResumeUploader onUpload={handleQuickUpload} />
          </Card>
        </div>

        {/* Right Column: AI Skill Insights & Activity Stream */}
        <div className="space-y-6">
          {/* Top Extracted Skills Card */}
          <Card className="p-6 border-slate-200/80">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-purple-600" />
                <span>Top Candidate Skills</span>
              </h3>
              <Badge variant="primary" className="text-[10px]">
                AI Taxonomy
              </Badge>
            </div>

            <div className="space-y-3.5">
              {stats?.topSkills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{skill.name}</span>
                    <span className="text-purple-700 font-bold">{skill.count} profiles</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 p-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-500"
                      style={{ width: `${skill.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* System Performance Card */}
          <Card className="p-6 border-purple-100 bg-gradient-to-b from-purple-50/60 to-pink-50/20">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <h3 className="text-sm font-bold text-slate-900">Why Resume Parser?</h3>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 mt-3 font-medium">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Extract work history, education & skills in under 2 seconds</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Automated AI match scoring against target job descriptions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span>Career timeline risk detection & gap verification</span>
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </PageContainer>
  )
}
