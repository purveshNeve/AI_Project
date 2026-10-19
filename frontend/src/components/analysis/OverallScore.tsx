import { formatScoreTier } from '../../utils/formatScore'
import Card from '../common/Card'
import Badge from '../common/Badge'
import { Sparkles, ShieldCheck } from 'lucide-react'

export interface OverallScoreProps {
  score?: number
  confidenceScore?: number
}

export default function OverallScore({ score, confidenceScore }: OverallScoreProps) {
  const tier = score != null ? formatScoreTier(score) : null
  const radius = 42
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = score != null
    ? circumference - (score / 100) * circumference
    : circumference

  return (
    <Card className="p-6 border-[#D8C8BB]/80 bg-gradient-to-b from-white via-white to-[#F5EFE6]/40 text-center relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <Badge
          variant="ai"
          icon={<Sparkles className="h-3.5 w-3.5 text-[#6F4E37]" />}
        >
          AI Match Index
        </Badge>

        {confidenceScore != null && (
          <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            {confidenceScore}% Confidence
          </span>
        )}
      </div>

      {/* Score Circular Ring */}
      <div className="relative my-4 inline-flex items-center justify-center">
        <svg className="h-32 w-32 -rotate-90 transform">
          <circle
            cx="64"
            cy="64"
            r={radius}
            className="stroke-slate-100"
            strokeWidth="8"
            fill="transparent"
          />

          <circle
            cx="64"
            cy="64"
            r={radius}
            className={
              score != null
                ? 'stroke-[#6F4E37] transition-all duration-1000 ease-out'
                : 'stroke-slate-200'
            }
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {score != null ? `${score}%` : '—'}
          </span>

          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F4E37]">
            {score != null ? 'Match Score' : 'Not analyzed'}
          </span>
        </div>
      </div>

      <div className="mt-2">
        {tier ? (
          <>
            <Badge
              variant={tier.badgeVariant}
              className="text-xs px-3 py-1 font-bold"
            >
              {tier.label}
            </Badge>

            <p className="text-xs text-slate-600 mt-2 leading-relaxed max-w-xs mx-auto">
              Candidate match score based on the available analysis.
            </p>
          </>
        ) : (
          <p className="text-xs text-slate-600 mt-2 leading-relaxed max-w-xs mx-auto">
            A job description has not been provided, so no match score is available.
          </p>
        )}
      </div>
    </Card>
  )
}