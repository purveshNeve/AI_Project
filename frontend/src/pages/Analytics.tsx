import PageContainer from '../components/layout/PageContainer'
import Card from '../components/common/Card'
import { BarChart3, TrendingUp, PieChart, ShieldCheck } from 'lucide-react'

export default function Analytics() {
  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#2F241F] font-sans">
            Analytics & Skill Metrics
          </h1>
          <p className="text-xs text-[#75685F] mt-0.5">
            Aggregated talent pool intelligence, skill distribution, and parsing throughput.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 border-[#DED4CA]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#75685F] uppercase tracking-wider">Candidate Match Rate</h3>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-[#2F241F] mt-2">88.4%</div>
          <p className="text-xs text-[#75685F] mt-1">+3.2% compared to last month</p>
        </Card>

        <Card className="p-6 border-[#DED4CA]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#75685F] uppercase tracking-wider">Parsing Accuracy</h3>
            <ShieldCheck className="h-4 w-4 text-[#8B5E3C]" />
          </div>
          <div className="text-2xl font-bold text-[#2F241F] mt-2">98.6%</div>
          <p className="text-xs text-[#75685F] mt-1">Verified across 1,248 profiles</p>
        </Card>

        <Card className="p-6 border-[#DED4CA]">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-[#75685F] uppercase tracking-wider">Avg Processing Time</h3>
            <BarChart3 className="h-4 w-4 text-[#8B5E3C]" />
          </div>
          <div className="text-2xl font-bold text-[#2F241F] mt-2">1.8s</div>
          <p className="text-xs text-[#75685F] mt-1">Ultra-fast neural engine</p>
        </Card>
      </div>

      <Card className="p-8 text-center border-[#DED4CA] bg-[#F7F3EE]">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EFE8DF] text-[#8B5E3C] mx-auto mb-4">
          <PieChart className="h-6 w-6" />
        </div>
        <h3 className="text-sm font-semibold text-[#2F241F]">Talent Pool Skill Matrix</h3>
        <p className="text-xs text-[#75685F] mt-1 max-w-md mx-auto">
          Deep skill taxonomy charts and candidate distribution vectors are updated automatically as new resumes are parsed.
        </p>
      </Card>
    </PageContainer>
  )
}
