import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import PageContainer from '../components/layout/PageContainer'
import ResumeUploader from '../components/analysis/ResumeUploader'
import JobDescription from '../components/analysis/JobDescription'
import Card from '../components/common/Card'
import Badge from '../components/common/Badge'
import { analysisService, type AnalysisUploadResponse } from '../services/analysisService'
import { Sparkles, ArrowLeft, ShieldCheck } from 'lucide-react'

export default function NewAnalysis() {
  const navigate = useNavigate()
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [submitMessage, setSubmitMessage] = useState('')
  const [analysis, setAnalysis] = useState<AnalysisUploadResponse | null>(null)

  const handleSubmit = async (jobDescriptionFile: File) => {
    if (!resumeFile) return

    setIsSubmitting(true)
    setSubmitError('')
    setSubmitMessage('')
    setAnalysis(null)
    try {
      const result = await analysisService.uploadAnalysisFiles(resumeFile, jobDescriptionFile)
      console.log("ANALYSIS RESPONSE:", result);
      setAnalysis({
        ...result,
        overall_score: result.overall_score,
        requirements: result.requirements.map((requirement) => ({
          requirement: requirement.requirement,
          score: requirement.score,
          match_level: requirement.match_level,
          supporting_evidence: requirement.supporting_evidence,
        })),
      })
      setSubmitMessage('Resume and job description analyzed successfully.')
    } catch (err) {
      console.error('Resume and job description upload failed', err)
      if (axios.isAxiosError(err)) {
        const responseData: unknown = err.response?.data
        if (
          typeof responseData === 'object' &&
          responseData !== null &&
          'detail' in responseData &&
          typeof responseData.detail === 'string'
        ) {
          setSubmitError(responseData.detail)
        } else if (err.code === 'ERR_NETWORK') {
          setSubmitError('Cannot connect to the API server. Make sure the backend is running on port 8010.')
        } else {
          setSubmitError(err.message)
        }
      } else {
        setSubmitError('Could not upload the files. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageContainer>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              Upload Resume for AI Parsing
            </h1>
            <Badge variant="ai" icon={<Sparkles className="h-3.5 w-3.5 text-[#6F4E37]" />}>
              Deep Extraction
            </Badge>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Upload single or bulk candidate resumes to parse skills, work history, and calculate match scores.
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Zone Card */}
        <div className="lg:col-span-2">
          <Card className="p-8 border-[#D8C8BB]/80 bg-gradient-to-b from-white via-white to-[#F5EFE6]/40">
            <ResumeUploader
              onUpload={setResumeFile}
              onClear={() => setResumeFile(null)}
              pdfOnly
            />
          </Card>
        </div>

        {/* Job Target Config Panel */}
        <div className="space-y-6">
          <JobDescription
            onSubmit={handleSubmit}
            canSubmit={resumeFile !== null}
            isSubmitting={isSubmitting}
            submitError={submitError}
            submitMessage={submitMessage}
          />

          <Card className="p-6 border-slate-200/80 bg-slate-50/50">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Supported File Standards
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload PDF resumes and job descriptions up to 25 MB each. Text is extracted from both PDFs when submitted.
            </p>
          </Card>
        </div>
      </div>

      {analysis && (
        <section className="mt-8 space-y-5" aria-label="Resume match analysis results">
          <Card className="border-[#D8C8BB] bg-gradient-to-r from-white to-[#F8F3EE] p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Overall Match Score
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                  Average of the deterministic scores for {analysis.requirements.length} extracted job requirements.
                </p>
              </div>

              <div className="text-3xl font-extrabold text-[#6B4632]">
                {analysis.overall_score.toFixed(1)}%
              </div>
            </div>
          </Card>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900">Requirement match details</h2>
            {analysis.requirements.length === 0 ? (
              <Card>
                <p className="text-sm text-slate-600">
                  No individual requirements were detected in the job description.
                </p>
              </Card>
            ) : (
              analysis.requirements.map((item, index) => (
                <Card key={`${index}-${item.requirement}`} className="space-y-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900">{item.requirement}</h3>
                      <p className="mt-1 text-xs font-medium text-[#6B4632]">{item.match_level}</p>
                    </div>
                    <span className="shrink-0 text-lg font-bold text-slate-900">
                      {item.score.toFixed(1)}%
                    </span>
                  </div>

                  {item.supporting_evidence.length === 0 ? (
                    <p className="rounded-xl bg-slate-50 p-3 text-xs text-slate-500">
                      No matching resume evidence was found.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {item.supporting_evidence.map((evidence) => (
                        <div
                          key={evidence.chunk_id}
                          className="rounded-xl border border-slate-100 bg-slate-50/80 p-3"
                        >
                          <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
                              {evidence.section}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-600">
                              Similarity {(evidence.similarity_score * 100).toFixed(1)}%
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap text-xs leading-relaxed text-slate-700">
                            {evidence.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </section>
      )}
    </PageContainer>
  )
}
