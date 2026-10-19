import { Link } from 'react-router-dom'
import type { CandidateResume } from '../../types/resume'
import Card from '../common/Card'
import Badge from '../common/Badge'
import Button from '../common/Button'
import { formatScoreTier } from '../../utils/formatScore'
import { formatDate } from '../../utils/formatDate'
import { FileText, ArrowUpRight, Clock } from 'lucide-react'

export interface RecentAnalysisProps {
  resumes: CandidateResume[]
}

export default function RecentAnalysis({ resumes }: RecentAnalysisProps) {
  if (!resumes || resumes.length === 0) {
    return (
      <Card className="p-8 text-center border-[#DED4CA]">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFE8DF] text-[#8B5E3C] mx-auto mb-3">
          <FileText className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-[#2F241F]">No resumes uploaded yet</h3>
        <p className="text-xs text-[#75685F] mt-1 max-w-sm mx-auto">
          Upload a candidate resume to extract and save skills, work history, and other profile details.
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
    <Card className="p-6 border-[#DED4CA]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-semibold text-[#2F241F] flex items-center gap-2">
            <span>Recent Candidate Intelligence</span>
            <span className="flex h-1.5 w-1.5 rounded-full bg-[#8B5E3C]" />
          </h2>
          <p className="text-xs text-[#75685F] mt-0.5">Latest saved candidate profiles and extracted skills</p>
        </div>
        <Link to="/history">
          <Button variant="ghost" size="sm" className="text-xs gap-1">
            <span>View All</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      <div className="divide-y divide-[#EDE6DE]">
        {resumes.map((resume) => {
          const tier = resume.overallScore != null ? formatScoreTier(resume.overallScore) : null
          const isProcessing = resume.status === 'processing'

          return (
            <div
              key={resume.id}
              className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-[#F0E6DC]/30 -mx-6 px-6 transition-colors rounded-lg"
            >
              {/* Candidate Info */}
              <div className="flex items-start gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EFE8DF] text-[#8B5E3C] font-bold text-xs border border-[#DED4CA]">
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
                      className="text-sm font-semibold text-[#2F241F] hover:text-[#8B5E3C] transition-colors"
                    >
                      {resume.candidateName}
                    </Link>
                    {isProcessing ? (
                      <Badge variant="warning" dot>
                        Processing
                      </Badge>
                    ) : (
                      <Badge variant="ai">Parsed</Badge>
                    )}
                  </div>

                  <div className="text-xs text-[#75685F] font-medium mt-0.5">
                    {resume.jobTitle} • {resume.experienceYears != null
                      ? `${resume.experienceYears} yrs exp`
                      : 'Experience not specified'}
                  </div>

                  {/* Skills Pills */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    {resume.skills.slice(0, 4).map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center rounded-md bg-[#EFE8DF] px-2 py-0.5 text-[11px] font-medium text-[#75685F]"
                      >
                        {skill}
                      </span>
                    ))}
                    {resume.skills.length > 4 && (
                      <span className="text-[10px] font-medium text-[#A08C81]">
                        +{resume.skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Match Score & Action */}
              <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2 border-t border-[#EDE6DE] sm:border-0 pt-2 sm:pt-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#75685F] font-medium">AI Match</span>
                  <span className={`text-base font-bold ${tier?.color ?? 'text-[#A08C81]'}`}>
                    {resume.overallScore != null ? `${resume.overallScore}%` : 'Not analyzed'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-[#A08C81] flex items-center gap-1">
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
