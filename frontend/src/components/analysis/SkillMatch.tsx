import Card from '../common/Card'
import Badge from '../common/Badge'
import ProgressBar from '../common/ProgressBar'
import { CheckCircle2, AlertTriangle, Layers } from 'lucide-react'

export interface SkillMatchProps {
  skills: string[]
  matchedSkills: string[]
  missingSkills: string[]
}

export default function SkillMatch({ skills, matchedSkills, missingSkills }: SkillMatchProps) {
  const matchRatio = Math.round((matchedSkills.length / Math.max(skills.length, 1)) * 100)

  return (
    <Card className="p-6 border-slate-200/80">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-4 w-4 text-purple-600" />
            <span>Technical Skill Matrix</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Automated skill matching against target job criteria</p>
        </div>
        <Badge variant="primary" className="font-semibold">
          {matchedSkills.length} / {skills.length} Matched
        </Badge>
      </div>

      <div className="mb-5">
        <ProgressBar value={matchRatio} max={100} showValue label="Skill Coverage Ratio" size="md" />
      </div>

      <div className="space-y-4">
        {/* Matched Skills */}
        <div>
          <h4 className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Verified Matched Skills ({matchedSkills.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {matchedSkills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 text-xs font-semibold text-emerald-800"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Missing Skills */}
        {missingSkills.length > 0 && (
          <div className="border-t border-slate-100 pt-3">
            <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />
              Missing or Desirable Skills ({missingSkills.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {missingSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200/80 px-2.5 py-1 text-xs font-medium text-amber-800"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
