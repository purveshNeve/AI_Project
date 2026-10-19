import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PageContainer from '../components/layout/PageContainer'
import StatsCard from '../components/dashboard/StatsCard'
import RecentAnalysis from '../components/dashboard/RecentAnalysis'
import ResumeUploader from '../components/analysis/ResumeUploader'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { analysisService } from '../services/analysisService'
import type { CandidateResume, AnalysisStats } from '../types/resume'
import {
  FileText,
  CheckCircle2,
  Clock,
  Award,
  UploadCloud,
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
          <h1 className="text-2xl font-semibold tracking-tight text-[#2F241F] font-sans mb-1">
            Resume Analyzer
          </h1>
          <p className="text-sm text-[#75685F]">
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
            <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-medium text-rose-700">
              {loadError}
            </p>
          )}
          <RecentAnalysis resumes={recentResumes} />

          {/* Quick Drag & Drop Section */}
          <Card className="p-6 border-[#DED4CA]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#2F241F] flex items-center gap-2">
                  <UploadCloud className="h-4 w-4 text-[#8B5E3C]" />
                  <span>Quick Resume Upload</span>
                </h3>
                <p className="text-xs text-[#75685F] mt-0.5">Drag any PDF or Word resume for instant parsing</p>
              </div>
            </div>
            <ResumeUploader onUpload={handleQuickUpload} />
          </Card>
        </div>

        {/* Right Column: AI Skill Insights & Activity Stream */}
        <div className="space-y-6">
          {/* Top Extracted Skills Card */}
          <Card className="p-6 border-[#DED4CA]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#2F241F] flex items-center gap-2">
                <BrainCircuit className="h-4 w-4 text-[#8B5E3C]" />
                <span>Top Candidate Skills</span>
              </h3>
            </div>

            <div className="space-y-3">
              {stats?.topSkills.map((skill) => (
                <div key={skill.name}>
                  <div className="flex items-center justify-between text-xs font-medium text-[#2F241F] mb-1.5">
                    <span>{skill.name}</span>
                    <span className="text-[#8B5E3C] font-semibold">{skill.count} profiles</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#EFE8DF]">
                    <div
                      className="h-full rounded-full bg-[#8B5E3C] transition-all duration-500"
                      style={{ width: `${skill.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Platform Features Card */}
          <Card className="p-6 border-[#DED4CA] bg-[#F7F3EE]">
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit className="h-4 w-4 text-[#8B5E3C]" />
              <h3 className="text-sm font-semibold text-[#2F241F]">Platform Capabilities</h3>
            </div>
            <ul className="text-xs text-[#75685F] space-y-2.5 font-medium">
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
