import { Link } from 'react-router-dom'
import type { CandidateResume } from '../../types/resume'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Button from '../common/Button'
import { formatScoreTier } from '../../utils/formatScore'
import { formatDate } from '../../utils/formatDate'
import { Sparkles, FileText, ArrowUpRight, Clock } from 'lucide-react'

export interface RecentAnalysisProps {
  resumes: CandidateResume[]
}

export default function RecentAnalysis({ resumes }: RecentAnalysisProps) {
  if (!resumes || resumes.length === 0) {
    return (
      <Card className="p-8 text-center border-slate-200/80">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600 mx-auto mb-3">
          <FileText className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">No resumes analyzed yet</h3>
        <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
          Upload your first candidate resume to automatically extract skills, work history, and AI match scores.
        </p>
        <Link to="/upload" className="inline-block mt-4">
          <Button variant="primary" size="sm">
            Upload Resume
          </Button>
        </Link>
      </Card>
    )
  }

  return (
    <Card className="p-6 border-slate-200/80">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Recent Candidate Intelligence</span>
            <span className="flex h-2 w-2 rounded-full bg-purple-600" />
          </h2>
          <p className="text-xs text-slate-600 mt-0.5">Latest AI-parsed candidate profiles and skill match scores</p>
        </div>
        <Link to="/history">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            <span>View All</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      <div className="divide-y divide-slate-100">
        {resumes.map((resume) => {
          const tier = formatScoreTier(resume.overallScore)
          const isProcessing = resume.status === 'processing'

          return (
            <div
              key={resume.id}
              className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-purple-50/20 -mx-6 px-6 transition-colors rounded-xl"
            >
              {/* Candidate Info */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-100 to-pink-100 text-purple-700 font-bold text-sm border border-purple-200/60 shadow-2xs">
                  {resume.candidateName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/analysis/${resume.id}`}
                      className="text-sm font-semibold text-slate-900 hover:text-purple-600 transition-colors"
                    >
                      {resume.candidateName}
                    </Link>
                    {isProcessing ? (
                      <Badge variant="warning" dot>
                        Processing
                      </Badge>
                    ) : (
                      <Badge variant="ai" icon={<Sparkles className="h-3 w-3 text-purple-600" />}>
                        AI Parsed
                      </Badge>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 font-medium mt-0.5">
                    {resume.jobTitle} • {resume.experienceYears} yrs exp
                  </div>

                  {/* Skills Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {resume.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
                      >
                        {skill}
                      </span>
                    ))}
                    {resume.skills.length > 4 && (
                      <span className="text-[10px] font-medium text-slate-600">
                        +{resume.skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Match Score & Action */}
              <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 border-t border-slate-100 sm:border-0 pt-2 sm:pt-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-600 font-medium">AI Match</span>
                  <span className={`text-base font-extrabold ${tier.color}`}>
                    {resume.overallScore}%
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-600 flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(resume.createdAt)}
                  </span>

                  <Link to={`/analysis/${resume.id}`}>
                    <Button variant="secondary" size="sm" className="text-xs">
                      View Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
