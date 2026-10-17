import { useState, useEffect } from 'react'
import { Sparkles, CheckCircle2, Clock, BrainCircuit } from 'lucide-react'
import Card from '../common/Card'
import ProgressBar from '../common/ProgressBar'

export interface AnalysisProgressProps {
  onComplete?: () => void
}

export default function AnalysisProgress({ onComplete }: AnalysisProgressProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(15)

  const steps = [
    { title: 'Contact Information Extraction', detail: 'Parsing name, email, phone, location & profiles' },
    { title: 'Work History & Timeline Analysis', detail: 'Calculating career progression and tenure metrics' },
    { title: 'Education & Credential Verification', detail: 'Extracting degrees, universities, and certifications' },
    { title: 'AI Skill Matrix & Semantic Matching', detail: 'Scoring core technical skills against target role' },
    { title: 'Risk Signals & AI Summary Synthesis', detail: 'Generating candidate recommendations' },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          if (onComplete) onComplete()
          return 100
        }
        const next = prev + 20
        setCurrentStep(Math.min(Math.floor((next / 100) * steps.length), steps.length - 1))
        return next
      })
    }, 700)

    return () => clearInterval(timer)
  }, [onComplete, steps.length])

  return (
    <Card className="max-w-xl mx-auto p-8 border-purple-200 shadow-md bg-gradient-to-b from-white to-purple-50/20 text-center">
      {/* Animated AI Spinner */}
      <div className="relative flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white shadow-lg mx-auto mb-6">
        <Sparkles className="h-10 w-10 animate-spin" />
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-purple-600 to-pink-500 opacity-30 blur-md -z-10" />
      </div>

      <h2 className="text-xl font-bold text-slate-900">AI is analyzing your resume...</h2>
      <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
        Deep neural extraction in progress. Mapping candidate experience to job requirements.
      </p>

      <div className="mt-6 mb-8">
        <ProgressBar value={progress} max={100} showValue label="Parsing progress" size="lg" />
      </div>

      {/* Steps List */}
      <div className="space-y-3 text-left border-t border-slate-100 pt-6">
        {steps.map((step, idx) => {
          const isDone = idx < currentStep || progress === 100
          const isCurrent = idx === currentStep && progress < 100

          return (
            <div
              key={step.title}
              className={[
                'flex items-center gap-3 p-3 rounded-xl transition-all',
                isCurrent ? 'bg-purple-50 border border-purple-200' : 'bg-slate-50/60',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {isDone ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              ) : isCurrent ? (
                <BrainCircuit className="h-5 w-5 text-purple-600 animate-pulse shrink-0" />
              ) : (
                <Clock className="h-5 w-5 text-slate-300 shrink-0" />
              )}

              <div>
                <h4
                  className={[
                    'text-xs font-semibold',
                    isDone ? 'text-slate-900' : isCurrent ? 'text-purple-900 font-bold' : 'text-slate-400',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {step.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">{step.detail}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
