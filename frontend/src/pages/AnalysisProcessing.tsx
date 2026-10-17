import { useParams, useNavigate } from 'react-router-dom'
import PageContainer from '../components/layout/PageContainer'
import AnalysisProgress from '../components/analysis/AnalysisProgress'

export default function AnalysisProcessing() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const handleComplete = () => {
    navigate(`/analysis/${id || 'res-101'}`)
  }

  return (
    <PageContainer>
      <div className="py-12 flex flex-col items-center justify-center">
        <AnalysisProgress onComplete={handleComplete} />
      </div>
    </PageContainer>
  )
}
