import PageContainer from '../components/layout/PageContainer'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import Button from '../components/common/Button'
import { Sparkles, Cpu, Key, ShieldCheck } from 'lucide-react'

export default function Settings() {
  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              Engine & Parsing Settings
            </h1>
            <Badge variant="ai" icon={<Sparkles className="h-3 w-3 text-purple-600" />}>
              Configuration
            </Badge>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Configure AI candidate matching strictness, API keys, and extraction taxonomies.
          </p>
        </div>
      </div>

      <div className="max-w-3xl space-y-6">
        <Card className="p-6 border-slate-200/80">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">AI Neural Engine Thresholds</h3>
              <p className="text-xs text-slate-500">Tune confidence and skill matching algorithms</p>
            </div>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Minimum Confidence Score</label>
              <select defaultValue="85" className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900">
                <option value="90">90% - Strict Verification</option>
                <option value="85">85% - Standard Recommended</option>
                <option value="75">75% - Relaxed Extraction</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Resume Parsing Model</label>
              <select defaultValue="v2.4" className="w-full h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-900">
                <option value="v2.4">Resume Parser Neural v2.4 (Default)</option>
                <option value="v1.8">Resume Parser Fast Extract v1.8</option>
              </select>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-slate-200/80">
          <div className="flex items-center gap-3 mb-4 border-b border-slate-100 pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
              <Key className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">API Credentials & Webhooks</h3>
              <p className="text-xs text-slate-500">Connect ATS, Lever, Greenhouse, or custom REST APIs</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span className="font-mono text-slate-700">sk_live_rp_984729103...</span>
            </div>
            <Badge variant="success" dot>Active</Badge>
          </div>

          <Button variant="primary" size="sm" className="mt-4">
            Save Settings
          </Button>
        </Card>
      </div>
    </PageContainer>
  )
}
