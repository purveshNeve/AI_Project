import Card from '../common/Card'
import { Sparkles, Lightbulb } from 'lucide-react'

export interface RecommendationsProps {
  insights: string[]
}

export default function Recommendations({ insights }: RecommendationsProps) {
  return (
    <Card className="p-6 border-[#D8C8BB]/80 bg-gradient-to-b from-white via-white to-[#F5EFE6]/40">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#6F4E37] text-white shadow-2xs">
          <Sparkles className="h-4 w-4" />
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900">
            AI Synthesized Recommendations
          </h3>
          <p className="text-[11px] text-slate-500">
            Key candidate highlights & interview focus areas
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-xl bg-white border border-[#E5D5C3] shadow-2xs"
          >
            <Lightbulb className="h-4 w-4 text-[#8B5E3C] shrink-0 mt-0.5" />
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {insight}
            </p>
          </div>
        ))}
      </div>
    </Card>
  )
}
