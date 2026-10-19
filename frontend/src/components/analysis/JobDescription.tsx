import { useRef, useState } from 'react'
import { FileText, ShieldCheck, Sparkles, Target, UploadCloud, X } from 'lucide-react'
import Button from '../common/Button'
import Card from '../common/Card'

const MAX_FILE_SIZE = 25 * 1024 * 1024

export interface JobDescriptionProps {
  onTargetSet?: (target: { title: string; skills: string[]; minExp: number }) => void
  onFileSelect?: (file: File | null) => void
  onSubmit?: (file: File) => void | Promise<void>
  canSubmit?: boolean
  isSubmitting?: boolean
  submitError?: string
  submitMessage?: string
}

export default function JobDescription({
  onFileSelect,
  onSubmit,
  canSubmit = true,
  isSubmitting = false,
  submitError,
  submitMessage,
}: JobDescriptionProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = (file: File) => {
    setError('')

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF job description.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('The PDF must be 25 MB or smaller.')
      return
    }

    setSelectedFile(file)
    onFileSelect?.(file)
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragOver(false)
    const file = event.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) processFile(file)
    event.target.value = ''
  }

  const clearFile = () => {
    setSelectedFile(null)
    setError('')
    onFileSelect?.(null)
  }

  const triggerBrowse = () => fileInputRef.current?.click()

  return (
    <Card className="border-[#D8C8BB]/80 bg-gradient-to-b from-white via-white to-[#F5EFE6]/40 p-6">
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#F2E9E0] text-[#6F4E37]">
          <Target className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Job Description</h3>
          <p className="text-xs text-slate-500">Upload a PDF to use as the candidate match target</p>
        </div>
      </div>

      <div className="w-full">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Select job description PDF"
        />

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={selectedFile ? undefined : triggerBrowse}
          className={[
            'relative flex cursor-pointer select-none flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center transition-all duration-200',
            isDragOver
              ? 'border-[#8B5E3C] bg-[#FCFAF7] scale-[1.01] shadow-lg'
              : selectedFile
                ? 'border-[#C4B5A8] bg-[#FCFAF7]'
                : 'border-[#DED4CA] bg-[#FCFAF7] hover:border-[#C4B5A8] hover:bg-[#F2E9E0] hover:shadow-sm',
          ].join(' ')}
        >
          {!selectedFile ? (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-[#8B5E3C] text-[#8B5E3C] shadow-sm mb-5 animate-float">
                <UploadCloud className="h-8 w-8" strokeWidth={1.8} />
              </div>

              <h4 className="text-lg font-bold tracking-tight text-slate-900">
                Drop your job description PDF here
              </h4>
              <p className="mt-1.5 max-w-sm text-sm text-slate-600">
                or click to browse from your computer. PDF files up to 25 MB are supported.
              </p>

              <span className="mt-5 rounded-lg border border-slate-200/80 bg-white/80 px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-2xs">
                PDF
              </span>

              <div className="mt-6">
                <Button
                  variant="primary"
                  size="md"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    triggerBrowse()
                  }}
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>Select JD PDF</span>
                </Button>
              </div>
            </>
          ) : (
            <div className="w-full rounded-2xl border border-[#D8C8BB] bg-white p-5 text-left shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#B89B85] bg-white text-[#6B4632]">
                    <FileText className="h-6 w-6" />
                  </div>

                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-bold text-slate-900">
                      {selectedFile.name}
                    </h4>

                    <p className="text-xs text-slate-600">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · PDF ready
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    clearFile()
                  }}
                  aria-label="Remove job description PDF"
                  className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-[#8B5E3C]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <p role="alert" className="mt-2 text-xs font-medium text-rose-600">
            {error}
          </p>
        )}
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-xs font-medium text-slate-600">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Secure file handling
        </span>
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-[#6F4E37]" />
          Candidate match target
        </span>
      </div>

      <div className="mt-4">
        <Button
          variant="primary"
          size="md"
          type="button"
          loading={isSubmitting}
          disabled={!selectedFile || !canSubmit || isSubmitting}
          onClick={() => selectedFile && onSubmit?.(selectedFile)}
        >
          <span>Submit for analysis</span>
        </Button>

        {!canSubmit && (
          <p className="mt-2 text-xs text-slate-500">
            Select a resume before submitting.
          </p>
        )}

        {submitError && (
          <p role="alert" className="mt-2 text-xs font-medium text-rose-600">
            {submitError}
          </p>
        )}

        {submitMessage && (
          <p role="status" className="mt-2 text-xs font-medium text-emerald-700">
            {submitMessage}
          </p>
        )}
      </div>
    </Card>
  )
}