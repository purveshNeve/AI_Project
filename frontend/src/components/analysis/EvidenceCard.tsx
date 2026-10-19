import type { WorkExperience, Education } from '../../types/resume'
import Card from '../common/Card'
import { Briefcase, GraduationCap, MapPin } from 'lucide-react'

export interface EvidenceCardProps {
  workHistory: WorkExperience[]
  education: Education[]
}

export default function EvidenceCard({ workHistory, education }: EvidenceCardProps) {
  return (
    <div className="space-y-6">
      {/* Work History */}
      <Card className="p-6 border-slate-200/80">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
          <Briefcase className="h-4 w-4 text-[#6F4E37]" />
          <span>Extracted Work History ({workHistory.length})</span>
        </h3>

        {workHistory.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No structured work experience recorded.</p>
        ) : (
          <div className="space-y-5 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200/60">
            {workHistory.map((work) => (
              <div key={work.id} className="relative pl-8">
                <div className="absolute left-1.5 top-1.5 h-4 w-4 rounded-full border-2 border-[#6F4E37] bg-white shadow-2xs" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-sm font-bold text-slate-900">{work.title}</h4>
                  <span className="text-xs font-semibold text-[#6F4E37] bg-[#F5EFE6] border border-[#E5D5C3] px-2 py-0.5 rounded-md self-start sm:self-auto">
                    {work.duration}
                  </span>
                </div>

                <div className="text-xs font-medium text-slate-600 mt-0.5 flex items-center gap-2">
                  <span>{work.company}</span>
                  {work.location && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <MapPin className="h-3 w-3" />
                      {work.location}
                    </span>
                  )}
                </div>

                {work.description && (
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {work.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Education */}
      <Card className="p-6 border-slate-200/80">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-4">
          <GraduationCap className="h-4 w-4 text-[#6F4E37]" />
          <span>Education & Degrees ({education.length})</span>
        </h3>

        {education.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No education history recorded.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {education.map((edu) => (
              <div key={edu.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50">
                <h4 className="text-xs font-bold text-slate-900">{edu.degree}</h4>
                <p className="text-xs text-slate-600 mt-0.5 font-medium">{edu.institution}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span>Graduated {edu.year}</span>
                  {edu.gpa && <span className="font-semibold text-[#6F4E37]">GPA {edu.gpa}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}