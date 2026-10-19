import type { CandidateResume } from '../../types/resume'
import AnalysisRow from './AnalysisRow'
import Card from '../common/Card'
import EmptyState from '../common/EmptyState'
import Button from '../common/Button'
import { FileText, Plus } from 'lucide-react'
import { Link } from 'react-router-dom'

export interface AnalysisTableProps {
  resumes: CandidateResume[]
  onDelete?: (id: string) => void
}

export default function AnalysisTable({ resumes, onDelete }: AnalysisTableProps) {
  if (!resumes || resumes.length === 0) {
    return (
      <EmptyState
        title="No candidate resumes found"
        description="No resumes match your current filter or upload query. Upload a resume to get started."
        icon={<FileText className="h-10 w-10 text-[#A08C81]" />}
        action={
          <Link to="/upload">
            <Button variant="primary" size="md">
              <Plus className="h-4 w-4" />
              <span>Upload New Resume</span>
            </Button>
          </Link>
        }
      />
    )
  }

  return (
    <Card className="p-0 border-[#DED4CA] overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#DED4CA] bg-[#F7F3EE] text-[10px] font-semibold uppercase tracking-wider text-[#A08C81]">
              <th className="py-3.5 pl-6 pr-4">Candidate & File</th>
              <th className="py-3.5 px-4">Target Job</th>
              <th className="py-3.5 px-4">Top Skills</th>
              <th className="py-3.5 px-4">AI Score</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Parsed Date</th>
              <th className="py-3.5 pr-6 pl-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDE6DE] text-xs">
            {resumes.map((resume) => (
              <AnalysisRow key={resume.id} resume={resume} onDelete={onDelete} />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
