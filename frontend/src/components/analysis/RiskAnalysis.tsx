import type { RiskSignal } from '../../types/resume'
import { getRiskBadgeStyle } from '../../utils/getRiskLevel'
import Card from '../common/Card'
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react'

export interface RiskAnalysisProps {
  signals: RiskSignal[]
}

export default function RiskAnalysis({ signals }: RiskAnalysisProps) {
  if (!signals || signals.length === 0) {
    return (
      <Card className="p-6 border-slate-200/80">
        <div className="flex items-center gap-2 mb-2">
          <ShieldCheck className="h-5 w-5 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900">Career & Risk Scanning</h3>
        </div>
        <p className="text-xs text-slate-500">No career timeline or credential risk anomalies detected.</p>
      </Card>
    )
  }

  return (
    <Card className="p-6 border-slate-200/80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-purple-600" />
          <span>AI Risk & Verification Radar</span>
        </h3>
        <span className="text-xs font-semibold text-slate-500">{signals.length} Signals Checked</span>
      </div>

      <div className="space-y-3">
        {signals.map((sig) => {
          const style = getRiskBadgeStyle(sig.level)

          return (
            <div
              key={sig.id}
              className={`p-3.5 rounded-xl border ${style.bg} flex items-start gap-3 transition-colors`}
            >
              <div className="mt-0.5">
                {sig.level === 'high' ? (
                  <ShieldAlert className="h-4 w-4 text-rose-600" />
                ) : sig.level === 'medium' ? (
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                ) : (
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold">{sig.title}</h4>
                  <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full border bg-white/70">
                    {style.label}
                  </span>
                </div>
                <p className="text-xs mt-1 leading-relaxed opacity-90">{sig.description}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
