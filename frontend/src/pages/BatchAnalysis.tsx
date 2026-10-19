import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  FileText,
  Loader2,
  Search,
  Trophy,
  UploadCloud,
  Users,
  XCircle,
} from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'
import Button from '../components/common/Button'
import { analysisService } from '../services/analysisService'
import { batchAnalysisService } from '../services/batchAnalysisService'
import type { CandidateResume } from '../types/resume'
import type {
  BatchCreateResponse,
  BatchResumeResult,
} from '../services/batchAnalysisService'

export default function BatchAnalysis() {
  const [resumes, setResumes] = useState<CandidateResume[]>([])
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [jobDescription, setJobDescription] = useState<File | null>(null)
  const [search, setSearch] = useState('')
  const [loadingResumes, setLoadingResumes] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [batch, setBatch] = useState<BatchCreateResponse | null>(null)
  const [results, setResults] = useState<BatchResumeResult[]>([])
  const [showAllResumes, setShowAllResumes] = useState(true)

  useEffect(() => {
    let active = true

    async function loadResumes() {
      try {
        setLoadingResumes(true)
        setError('')
        const data = await analysisService.getAllResumes()

        if (active) {
          setResumes(data)
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : 'Could not load saved resumes.',
          )
        }
      } finally {
        if (active) setLoadingResumes(false)
      }
    }

    void loadResumes()

    return () => {
      active = false
    }
  }, [])

  const filteredResumes = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return resumes

    return resumes.filter((resume) =>
      [
        resume.candidateName,
        resume.fileName,
        resume.email,
        resume.jobTitle,
      ].some((value) => value?.toLowerCase().includes(query)),
    )
  }, [resumes, search])

  const allFilteredSelected =
    filteredResumes.length > 0 &&
    filteredResumes.every((resume) => selectedIds.includes(resume.id))

  function toggleResume(id: string) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((selectedId) => selectedId !== id)
        : current.length < 50
          ? [...current, id]
          : current,
    )
  }

  function toggleFilteredResumes() {
    if (allFilteredSelected) {
      const visibleIds = new Set(filteredResumes.map((resume) => resume.id))
      setSelectedIds((current) =>
        current.filter((id) => !visibleIds.has(id)),
      )
    } else {
      setSelectedIds((current) => {
        const next = new Set(current)

        for (const resume of filteredResumes) {
          if (next.size >= 50) break
          next.add(resume.id)
        }

        return Array.from(next)
      })
    }
  }

  async function runBatch() {
    setError('')
    setBatch(null)
    setResults([])

    if (selectedIds.length === 0) {
      setError('Select at least one saved resume.')
      return
    }

    if (selectedIds.length > 50) {
      setError('You can analyze up to 50 resumes per batch.')
      return
    }

    if (!jobDescription) {
      setError('Upload a job-description PDF first.')
      return
    }

    if (!jobDescription.name.toLowerCase().endsWith('.pdf')) {
      setError('The job description must be a PDF file.')
      return
    }

    setSubmitting(true)

    try {
      const created = await batchAnalysisService.createBatch(
        selectedIds,
        jobDescription,
      )

      setBatch(created)

      const response = await batchAnalysisService.getBatchResults(
        created.batch_id,
      )

      setResults(response.results)
    } catch (err: unknown) {
      const message =
        typeof err === 'object' &&
        err !== null &&
        'response' in err &&
        typeof err.response === 'object' &&
        err.response !== null &&
        'data' in err.response &&
        typeof err.response.data === 'object' &&
        err.response.data !== null &&
        'detail' in err.response.data &&
        typeof err.response.data.detail === 'string'
          ? err.response.data.detail
          : err instanceof Error
            ? err.message
            : 'Batch analysis failed. Check that the backend is running.'

      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  const rankedResults = [...results]
    .filter((result) => result.status === 'completed')
    .sort((a, b) => {
      if (a.rank != null && b.rank != null) return a.rank - b.rank
      if (a.rank != null) return -1
      if (b.rank != null) return 1
      return (b.overall_score ?? -1) - (a.overall_score ?? -1)
    })

  const failedResults = results.filter(
    (result) => result.status !== 'completed',
  )

  function formatScore(score: number | null) {
    return score == null ? '—' : `${score.toFixed(1)}%`
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-7xl space-y-6 pb-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#6B4632]">
              <Users size={18} />
              Candidate comparison
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Batch Resume Analysis
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Compare multiple saved resumes against one job description
              and review the candidates ranked by your analysis backend.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start rounded-xl border border-[#D8C8BB] bg-white px-4 py-3">
            <Users size={20} className="text-[#6B4632]" />
            <div>
              <p className="text-lg font-bold text-slate-900">
                {selectedIds.length} / 50
              </p>
              <p className="text-xs text-slate-500">Selected resumes</p>
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              onClick={() => setError('')}
              aria-label="Dismiss error"
            >
              <XCircle size={18} />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Select saved resumes
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Choose up to 50 candidates to compare.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={toggleFilteredResumes}
                  disabled={loadingResumes || filteredResumes.length === 0}
                  className="shrink-0 text-sm font-semibold text-[#6B4632] hover:text-[#4A3023] disabled:opacity-40"
                >
                  {allFilteredSelected ? 'Deselect visible' : 'Select visible'}
                </button>
              </div>

              <div className="relative mt-5">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, filename, email..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-[#B89B85] focus:bg-white focus:ring-2 focus:ring-[#E5D8CE]"
                />
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {loadingResumes ? (
                <div className="flex items-center justify-center gap-3 p-10 text-sm text-slate-500">
                  <Loader2 size={20} className="animate-spin" />
                  Loading saved resumes...
                </div>
              ) : filteredResumes.length === 0 ? (
                <div className="p-10 text-center">
                  <FileText
                    size={32}
                    className="mx-auto mb-3 text-slate-300"
                  />

                  <p className="font-medium text-slate-700">
                    {resumes.length === 0
                      ? 'No saved resumes found'
                      : 'No matching resumes'}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {resumes.length === 0
                      ? 'Upload and save resumes before starting a batch.'
                      : 'Try a different search term.'}
                  </p>
                </div>
              ) : (
                <>
                  {filteredResumes.slice(0, showAllResumes ? undefined : 6).map(
                    (resume) => {
                      const selected = selectedIds.includes(resume.id)

                      return (
                        <label
                          key={resume.id}
                          className={`flex cursor-pointer items-start gap-3 p-4 transition hover:bg-[#F8F3EE] ${
                            selected ? 'bg-[#F8F3EE]' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleResume(resume.id)}
                            disabled={!selected && selectedIds.length >= 50}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-[#8B5E3C] focus:ring-[#8B5E3C]"
                          />

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                            <FileText size={19} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-900">
                              {resume.candidateName || 'Unknown candidate'}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {resume.fileName}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-400">
                              {resume.email || 'No email available'}
                            </p>
                          </div>

                          {selected && (
                            <CheckCircle2
                              size={18}
                              className="mt-1 shrink-0 text-[#8B5E3C]"
                            />
                          )}
                        </label>
                      )
                    },
                  )}

                  {filteredResumes.length > 6 && (
                    <button
                      type="button"
                      onClick={() => setShowAllResumes((value) => !value)}
                      className="flex w-full items-center justify-center gap-2 p-4 text-sm font-medium text-[#6B4632] hover:bg-[#F8F3EE]"
                    >
                      {showAllResumes
                        ? 'Show fewer'
                        : `Show all ${filteredResumes.length} resumes`}

                      <ChevronDown
                        size={16}
                        className={showAllResumes ? 'rotate-180' : ''}
                      />
                    </button>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500">
              <span>{filteredResumes.length} resume(s) shown</span>

              <button
                type="button"
                onClick={() => setSelectedIds([])}
                disabled={selectedIds.length === 0}
                className="font-medium text-slate-600 hover:text-red-600 disabled:opacity-40"
              >
                Clear selection
              </button>
            </div>
          </section>

          <div className="space-y-6">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900">
                Job description
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Upload the PDF that all selected resumes will be compared
                against.
              </p>

              <label
                className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-7 text-center transition ${
                  jobDescription
                    ? 'border-[#B89B85] bg-[#F8F3EE]'
                    : 'border-slate-200 bg-slate-50 hover:border-[#B89B85] hover:bg-[#F8F3EE]'
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  className="sr-only"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null
                    setJobDescription(file)
                    setBatch(null)
                    setResults([])
                    setError('')
                    event.target.value = ''
                  }}
                />

                {jobDescription ? (
                  <CheckCircle2 size={32} className="text-[#8B5E3C]" />
                ) : (
                  <UploadCloud size={32} className="text-slate-400" />
                )}

                <span className="mt-3 text-sm font-semibold text-slate-800">
                  {jobDescription
                    ? 'Job description selected'
                    : 'Choose a job-description PDF'}
                </span>

                <span className="mt-1 max-w-full break-all text-xs text-slate-500">
                  {jobDescription
                    ? jobDescription.name
                    : 'PDF format · Maximum 25 MB'}
                </span>

                {!jobDescription && (
                  <span className="mt-3 text-xs font-medium text-[#6B4632]">
                    Browse files
                  </span>
                )}
              </label>

              {jobDescription && (
                <button
                  type="button"
                  onClick={() => {
                    setJobDescription(null)
                    setBatch(null)
                    setResults([])
                  }}
                  className="mt-3 text-xs font-medium text-red-600 hover:text-red-800"
                >
                  Remove selected file
                </button>
              )}

              <div className="mt-6 rounded-xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">
                  Ready to analyze?
                </p>

                <ul className="mt-3 space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    {selectedIds.length > 0 ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : (
                      <AlertCircle size={16} className="text-slate-400" />
                    )}
                    {selectedIds.length} resume(s) selected
                  </li>

                  <li className="flex items-center gap-2">
                    {jobDescription ? (
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    ) : (
                      <AlertCircle size={16} className="text-slate-400" />
                    )}
                    Job-description PDF {jobDescription ? 'attached' : 'required'}
                  </li>
                </ul>
              </div>

              <div className="mt-5">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={runBatch}
                  loading={submitting}
                  disabled={
                    submitting ||
                    loadingResumes ||
                    selectedIds.length === 0 ||
                    !jobDescription
                  }
                >
                  {submitting
                    ? 'Analyzing candidates...'
                    : 'Run batch analysis'}
                </Button>
              </div>

              {submitting && (
                <p
                  role="status"
                  className="mt-3 flex items-center gap-2 text-xs text-slate-500"
                >
                  <Loader2 size={15} className="animate-spin" />
                  Processing resumes. Please keep this page open.
                </p>
              )}
            </section>

            {batch && (
              <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={22}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />

                  <div>
                    <h3 className="font-semibold text-emerald-900">
                      Batch #{batch.batch_id} processed
                    </h3>

                    <p className="mt-1 text-sm text-emerald-800">
                      {batch.processed_resumes} processed · {batch.failed_resumes}{' '}
                      failed · {batch.total_resumes} total
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>

        {batch && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col justify-between gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Ranked candidates
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Results returned by the backend for batch #{batch.batch_id}.
                </p>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-[#F8F3EE] px-3 py-2 text-sm font-medium text-[#6B4632]">
                <Trophy size={17} />
                {rankedResults.length} ranked
              </div>
            </div>

            {rankedResults.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                No successful candidate results were returned for this batch.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[650px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Rank</th>
                      <th className="px-5 py-4 font-semibold">Candidate</th>
                      <th className="px-5 py-4 font-semibold">Resume file</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Match score
                      </th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Result
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {rankedResults.map((result, index) => (
                      <tr
                        key={result.result_id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-full font-bold ${
                              index === 0
                                ? 'bg-[#F1E5DA] text-[#6B4632]'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {result.rank ?? index + 1}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {result.candidate_name || 'Unknown candidate'}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            Resume ID: {result.resume_id}
                          </p>
                        </td>

                        <td className="max-w-[240px] truncate px-5 py-4 text-slate-600">
                          {result.filename || 'Unknown file'}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <span className="text-lg font-bold tabular-nums text-slate-900">
                            {formatScore(result.overall_score)}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            <CheckCircle2 size={14} />
                            Completed
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {failedResults.length > 0 && (
              <div className="border-t border-slate-200 p-5 sm:p-6">
                <h3 className="flex items-center gap-2 font-semibold text-red-700">
                  <XCircle size={18} />
                  Failed resumes ({failedResults.length})
                </h3>

                <div className="mt-3 space-y-3">
                  {failedResults.map((result) => (
                    <div
                      key={result.result_id}
                      className="rounded-xl border border-red-100 bg-red-50 p-4"
                    >
                      <p className="text-sm font-semibold text-slate-800">
                        {result.candidate_name ||
                          result.filename ||
                          `Resume ${result.resume_id}`}
                      </p>

                      <p className="mt-1 text-sm text-red-700">
                        {result.error_message ||
                          'The backend could not process this resume.'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rankedResults.length > 0 && (
              <div className="border-t border-slate-100 p-5 sm:p-6">
                <h3 className="text-base font-semibold text-slate-900">
                  Requirement-level scores
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Expand a candidate to inspect the requirement scores and
                  supporting evidence returned by the API.
                </p>

                <div className="mt-4 space-y-3">
                  {rankedResults.map((result) => (
                    <details
                      key={result.result_id}
                      className="group rounded-xl border border-slate-200"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-slate-900">
                            #{result.rank ?? '—'} ·{' '}
                            {result.candidate_name || 'Unknown candidate'}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {result.requirements?.length ?? 0} requirement(s) scored
                          </p>
                        </div>

                        <ChevronDown
                          size={18}
                          className="shrink-0 text-slate-400 transition group-open:rotate-180"
                        />
                      </summary>

                      <div className="space-y-3 border-t border-slate-100 p-4">
                        {!result.requirements?.length ? (
                          <p className="text-sm text-slate-500">
                            No requirement-level scores were returned.
                          </p>
                        ) : (
                          result.requirements.map((requirement, index) => (
                            <div
                              key={`${result.result_id}-${index}`}
                              className="rounded-lg bg-slate-50 p-3"
                            >
                              <div className="flex flex-col justify-between gap-2 sm:flex-row">
                                <p className="text-sm font-medium text-slate-800">
                                  {requirement.requirement}
                                </p>

                                <span className="shrink-0 text-sm font-bold text-[#6B4632]">
                                  {formatScore(requirement.score)}
                                </span>
                              </div>

                              <p className="mt-1 text-xs text-slate-500">
                                Match level: {requirement.match_level}
                              </p>

                              {requirement.supporting_evidence?.map(
                                (evidence, evidenceIndex) => (
                                  <blockquote
                                    key={`${evidence.chunk_id}-${evidenceIndex}`}
                                    className="mt-3 border-l-2 border-[#B89B85] pl-3 text-xs leading-5 text-slate-600"
                                  >
                                    <p>{evidence.text}</p>

                                    <p className="mt-1 text-slate-400">
                                      {evidence.section} · Similarity:{' '}
                                      {formatScore(evidence.similarity_score)}
                                    </p>
                                  </blockquote>
                                ),
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </PageContainer>
  )
}