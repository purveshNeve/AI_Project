import { Link } from 'react-router-dom'
import type { CandidateResume } from '../../types/resume'
import Badge from '../common/Badge'
import Button from '../common/Button'
import { formatScoreTier } from '../../utils/formatScore'
import { formatDate } from '../../utils/formatDate'
import { Eye, Trash2, Sparkles } from 'lucide-react'

export interface AnalysisRowProps {
  resume: CandidateResume
  onDelete?: (id: string) => void
}

export default function AnalysisRow({ resume, onDelete }: AnalysisRowProps) {
  const tier = formatScoreTier(resume.overallScore)

  return (
    <tr className="border-b border-slate-100 hover:bg-purple-50/20 transition-colors group">
      {/* Candidate Name & File */}
      <td className="py-3.5 pl-6 pr-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-700 font-bold text-xs border border-purple-100">
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
              className="text-xs font-bold text-slate-900 hover:text-purple-600 transition-colors"
            >
              {resume.candidateName}
            </Link>
            <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[180px]">
              {resume.fileName}
            </div>
          </div>
        </div>
      </td>

      {/* Target Job Title */}
      <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
        <div>{resume.jobTitle}</div>
        <div className="text-[11px] text-slate-400">{resume.experienceYears} Yrs Experience</div>
      </td>

      {/* Extracted Skills */}
      <td className="py-3.5 px-4">
        <div className="flex flex-wrap gap-1 max-w-xs">
          {resume.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700"
            >
              {skill}
            </span>
          ))}
          {resume.skills.length > 3 && (
            <span className="text-[10px] text-slate-400 font-medium">
              +{resume.skills.length - 3}
            </span>
          )}
        </div>
      </td>

      {/* AI Score */}
      <td className="py-3.5 px-4">
        <div className="flex items-center gap-2">
          <span className={`text-sm font-extrabold ${tier.color}`}>
            {resume.overallScore}%
          </span>
          <Badge variant={tier.badgeVariant} className="text-[10px]">
            {tier.label}
          </Badge>
        </div>
      </td>

      {/* Status */}
      <td className="py-3.5 px-4">
        {resume.status === 'parsed' ? (
          <Badge variant="ai" icon={<Sparkles className="h-3 w-3 text-purple-600" />}>
            Parsed
          </Badge>
        ) : (
          <Badge variant="warning" dot>
            Processing
          </Badge>
        )}
      </td>

      {/* Date */}
      <td className="py-3.5 px-4 text-xs text-slate-500 font-medium whitespace-nowrap">
        {formatDate(resume.createdAt)}
      </td>

      {/* Actions */}
      <td className="py-3.5 pr-6 pl-4 text-right">
        <div className="flex items-center justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
          <Link to={`/analysis/${resume.id}`}>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Candidate Profile">
              <Eye className="h-4 w-4 text-slate-600 hover:text-purple-600" />
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
