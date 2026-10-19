import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import PageContainer from '../components/layout/PageContainer'
import ResumeUploader from '../components/analysis/ResumeUploader'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import { ResumeService } from '../services/resumeService'
import { ArrowLeft, CheckCircle2, ShieldCheck, UploadCloud } from 'lucide-react'

function getUploadErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    return 'Could not upload the resume. Please try again.'
  }

  const responseData: unknown = error.response?.data
  if (
    typeof responseData === 'object' &&
    responseData !== null &&
    'detail' in responseData &&
    typeof responseData.detail === 'string'
  ) {
    return responseData.detail
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return 'The upload timed out. Please try again with a smaller PDF or a more stable connection.'
  }

  if (error.code === 'ERR_NETWORK' || !error.response) {
    return 'Cannot connect to the API server. Check that the backend is running and try again.'
  }

  switch (error.response.status) {
    case 400:
      return 'The server rejected the upload. Make sure the PDF is not empty.'
    case 404:
      return 'The resume upload endpoint was not found. Check the backend API configuration.'
    case 413:
      return 'The PDF exceeds the 25 MB limit.'
    case 415:
      return 'The file is not a valid PDF. Please select a readable PDF resume.'
    case 422:
      return 'The PDF could not be processed. It may be encrypted or contain no readable text.'
    case 500:
    case 503:
      return 'The server could not save or process the resume. Please try again later.'
    default:
      return `Upload failed (HTTP ${error.response.status}). Please try again.`
  }
}

export default function UploadResume() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setErrorMessage('')
    setSuccessMessage('')
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedFile || isUploading) return

    setIsUploading(true)
    setErrorMessage('')
    setSuccessMessage('')

    try {
      const uploadedResume = await ResumeService.uploadAndParse(selectedFile)
      setSuccessMessage(
        `${uploadedResume.candidateName} was uploaded and saved successfully. The resume was parsed; no job-match analysis was run.`,
      )
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Resume upload failed', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
        })
      } else {
        console.error(
          'Resume upload failed',
          error instanceof Error ? error.message : 'Unknown upload error',
        )
      }
      setErrorMessage(getUploadErrorMessage(error))
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <PageContainer>
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/dashboard"
          aria-label="Back to dashboard"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
            Upload Resume
          </h1>
          <p className="mt-0.5 text-sm text-slate-600">
            Upload a PDF to extract and save candidate information. No job description is needed.
          </p>
        </div>
      </div>

      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="border-[#D8C8BB]/80 bg-gradient-to-b from-white via-white to-[#F5EFE6]/40 p-6 sm:p-8 lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <ResumeUploader
              onUpload={handleFileSelect}
              onClear={() => {
                setSelectedFile(null)
                setErrorMessage('')
                setSuccessMessage('')
              }}
              isUploading={isUploading}
              pdfOnly
            />

            <div className="mt-6 flex flex-col items-start gap-3">
              <Button
                variant="primary"
                size="lg"
                type="submit"
                loading={isUploading}
                disabled={!selectedFile || isUploading}
              >
                <UploadCloud className="h-4 w-4" />
                <span>{isUploading ? 'Uploading Resume…' : 'Upload Resume'}</span>
              </Button>

              {isUploading && (
                <p role="status" className="text-xs font-medium text-[#6B4632]">
                  Uploading and parsing your PDF. Please keep this page open.
                </p>
              )}
              {errorMessage && (
                <p role="alert" className="text-sm font-medium text-rose-600">
                  {errorMessage}
                </p>
              )}
              {successMessage && (
                <div
                  role="status"
                  className="flex flex-col items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 sm:w-full sm:flex-row sm:items-center sm:justify-between"
                >
                  <span className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    {successMessage}
                  </span>
                  <Link to="/dashboard" className="shrink-0 font-semibold underline">
                    View Dashboard
                  </Link>
                </div>
              )}
            </div>
          </form>
        </Card>

        <Card className="h-fit border-slate-200/80 bg-slate-50/50 p-6">
          <h2 className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-900">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Supported file
          </h2>
          <p className="text-xs leading-relaxed text-slate-600">
            Select one PDF resume up to 25 MB. Candidate details are extracted and saved for the
            Dashboard and All Resumes list. Matching against a job description is a separate workflow.
          </p>
        </Card>
      </div>
    </PageContainer>
  )
}