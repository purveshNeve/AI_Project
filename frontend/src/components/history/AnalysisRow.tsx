import { Link } from 'react-router-dom'
import type { CandidateResume } from '../../types/resume'
import Badge from '../common/Badge'
import Button from '../common/Button'
import { formatScoreTier } from '../../utils/formatScore'
import { formatDate } from '../../utils/formatDate'
import { Eye, Trash2 } from 'lucide-react'

export interface AnalysisRowProps {
  resume: CandidateResume
  onDelete?: (id: string) => void
}

export default function AnalysisRow({ resume, onDelete }: AnalysisRowProps) {
  const tier = resume.overallScore != null ? formatScoreTier(resume.overallScore) : null

  return (
    <tr className="border-b border-[#EDE6DE] hover:bg-[#F0E6DC]/20 transition-colors group">
      {/* Candidate Name & File */}
      <td className="py-3.5 pl-6 pr-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EFE8DF] text-[#8B5E3C] font-bold text-xs border border-[#DED4CA]">
            {resume.candidateName
              .split(' ')
              .map((n) => n[0])
              .join('')
              .substring(0, 2)
              .toUpperCase()}
          </div>
          <div>
            <Link
              to={`/analysis/${resume.id}`}
              className="text-xs font-semibold text-[#2F241F] hover:text-[#8B5E3C] transition-colors"
            >
              {resume.candidateName}
            </Link>
            <div className="text-[11px] text-[#A08C81] font-mono mt-0.5 truncate max-w-[180px]">
              {resume.fileName}
            </div>
          </div>
        </div>
      </td>

      {/* Target Job Title */}
      <td className="py-3.5 px-4 text-xs font-medium text-[#2F241F]">
        <div>{resume.jobTitle}</div>
        <div className="text-[11px] text-[#A08C81]">
          {resume.experienceYears != null
            ? `${resume.experienceYears} Yrs Experience`
            : 'Experience not specified'}
        </div>
      </td>

      {/* Extracted Skills */}
      <td className="py-3.5 px-4">
        <div className="flex flex-wrap gap-1 max-w-xs">
          {resume.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center rounded-md bg-[#EFE8DF] px-2 py-0.5 text-[10px] font-medium text-[#75685F]"
            >
              {skill}
            </span>
          ))}
          {resume.skills.length > 3 && (
            <span className="text-[10px] text-[#A08C81] font-medium">
              +{resume.skills.length - 3}
            </span>
          )}
        </div>
      </td>

      {/* AI Score */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-bold ${tier?.color ?? 'text-[#A08C81]'}`}>
            {resume.overallScore != null ? `${resume.overallScore}%` : 'Not analyzed'}
          </span>
          {tier && (
            <Badge variant={tier.badgeVariant} className="text-[10px]">
              {tier.label}
            </Badge>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="py-3.5 px-4">
        {resume.status === 'parsed' ? (
          <Badge variant="ai">Parsed</Badge>
        ) : (
          <Badge variant="warning" dot>
            Processing
          </Badge>
        )}
      </td>

      {/* Date */}
      <td className="py-3.5 px-4 text-xs text-[#A08C81] font-medium whitespace-nowrap">
        {formatDate(resume.createdAt)}
      </td>

      {/* Actions */}
      <td className="py-3.5 pr-6 pl-4 text-right">
        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
          <Link to={`/analysis/${resume.id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Candidate Profile">
              <Eye className="h-4 w-4 text-[#75685F] hover:text-[#8B5E3C]" />
            </Button>
          </Link>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-rose-500 hover:bg-rose-50"
              onClick={() => onDelete(resume.id)}
              title="Delete Resume"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}
