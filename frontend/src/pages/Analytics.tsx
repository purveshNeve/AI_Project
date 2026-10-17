import PageContainer from '../components/layout/PageContainer'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import { Sparkles, BarChart3, TrendingUp, PieChart, ShieldCheck } from 'lucide-react'

export default function Analytics() {
  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              AI Analytics & Skill Metrics
            </h1>
            <Badge variant="ai" icon={<Sparkles className="h-3 w-3 text-purple-600" />}>
              Live Data
            </Badge>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Aggregated talent pool intelligence, skill distribution, and parsing throughput.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 border-slate-200/80">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate Match Rate</h3>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">88.4%</div>
          <p className="text-xs text-slate-600 mt-1">+3.2% compared to last month</p>
        </Card>

        <Card className="p-6 border-slate-200/80">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Parsing Accuracy</h3>
            <ShieldCheck className="h-4 w-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">98.6%</div>
          <p className="text-xs text-slate-600 mt-1">Verified across 1,248 profiles</p>
        </Card>

        <Card className="p-6 border-slate-200/80">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Processing Time</h3>
            <BarChart3 className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">1.8s</div>
          <p className="text-xs text-slate-600 mt-1">Ultra-fast neural engine</p>
        </Card>
      </div>

      <Card className="p-8 text-center border-purple-200/80 bg-gradient-to-b from-white via-white to-purple-50/20">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 mx-auto mb-4 shadow-2xs">
          <PieChart className="h-7 w-7" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Talent Pool Skill Matrix</h3>
        <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
          Deep skill taxonomy charts and candidate distribution vectors are updated automatically as new resumes are parsed.
        </p>
      </Card>
    </PageContainer>
  )
}
