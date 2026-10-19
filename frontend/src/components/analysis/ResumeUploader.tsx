import { useState, useRef } from 'react'
import { UploadCloud, FileText, Sparkles, X, ShieldCheck } from 'lucide-react'
import Button from '../common/Button'

export interface ResumeUploaderProps {
  onUpload: (file: File) => void
  onClear?: () => void
  isUploading?: boolean
  pdfOnly?: boolean
}

export default function ResumeUploader({
  onUpload,
  onClear,
  isUploading = false,
  pdfOnly = false,
}: ResumeUploaderProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (isUploading) return
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      processFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isUploading) return
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  const processFile = (file: File) => {
    if (pdfOnly && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please select a PDF resume.')
      return
    }

    if (pdfOnly && file.size > 25 * 1024 * 1024) {
      setError('The PDF must be 25 MB or smaller.')
      return
    }

    setError('')
    setSelectedFile(file)
    onUpload(file)
  }

  const triggerBrowse = () => {
    fileInputRef.current?.click()
  }

  const clearFile = () => {
    setSelectedFile(null)
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClear?.()
  }

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        accept={pdfOnly ? '.pdf,application/pdf' : '.pdf,.doc,.docx,.txt'}
        onChange={handleFileChange}
        disabled={isUploading}
        className="hidden"
      />

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={selectedFile ? undefined : triggerBrowse}
        className={[
          'relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-10 text-center transition-all duration-200 cursor-pointer select-none',
          isDragOver
            ? 'border-[#8B5E3C] bg-[#FCFAF7] scale-[1.01] shadow-lg'
            : selectedFile
              ? 'border-[#C4B5A8] bg-[#FCFAF7]'
              : 'border-[#DED4CA] bg-[#FCFAF7] hover:border-[#C4B5A8] hover:bg-[#F2E9E0] hover:shadow-sm',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {!selectedFile ? (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white border border-[#8B5E3C] text-[#8B5E3C] shadow-sm mb-5 animate-float">
              <UploadCloud className="h-8 w-8" strokeWidth={1.8} />
            </div>

            <h3 className="text-xl font-bold tracking-tight text-[#2F241F]">
              Drop your {pdfOnly ? 'resume PDF' : 'resume file'} here
            </h3>

            <p className="text-sm text-[#75685F] mt-1.5 max-w-sm">
              or click to browse from your computer. {pdfOnly
                ? 'Candidate details will be extracted and saved from your resume.'
                : 'Our AI will extract candidate skills, work history, and match scores.'}
            </p>

            <div className="flex items-center gap-2 mt-5">
              {(pdfOnly ? ['PDF'] : ['PDF', 'DOC', 'DOCX', 'TXT']).map((ext) => (
                <span
                  key={ext}
                  className="rounded-lg bg-white/80 border border-[#DED4CA] px-2.5 py-1 text-xs font-semibold text-[#75685F] shadow-2xs"
                >
                  {ext}
                </span>
              ))}
            </div>

            <div className="mt-6">
              <Button
                variant="primary"
                size="md"
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  triggerBrowse()
                }}
              >
                <UploadCloud className="h-4 w-4" />
                <span>Select Resume File</span>
              </Button>
            </div>
          </>
        ) : (
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-[#D8C8BB] shadow-sm text-left">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#B89B85] bg-white text-[#6B4632]">
                  <FileText className="h-6 w-6" />
                </div>

                <div>
                  <h4 className="text-sm font-bold text-[#2F241F] truncate max-w-[220px]">
                    {selectedFile.name}
                  </h4>

                  <p className="text-xs text-[#75685F]">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Selected, ready to upload
                  </p>
                </div>
              </div>

              {!isUploading && (
                <button
                  type="button"
                  onClick={clearFile}
                  className="text-[#A08C81] hover:text-[#8B5E3C] transition-colors p-1 rounded-lg hover:bg-[#F2E9E0]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <p className="mt-3 flex items-center gap-2 rounded-xl border border-[#E5D8CE] bg-[#F8F3EE] p-2.5 text-xs font-medium text-[#6B4632]">
              <Sparkles className="h-4 w-4 text-[#8B5E3C]" />
              <span>
                {pdfOnly
                  ? 'The resume is selected and ready to upload.'
                  : 'The resume will be uploaded when you submit both files for analysis.'}
              </span>
            </p>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-rose-600">
          {error}
        </p>
      )}

      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-[#75685F] font-medium">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          SOC2 Compliant & Encrypted
        </span>

        <span className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-[#6F4E37]" />
          {pdfOnly ? 'AI Resume Parsing' : 'AI Skill Scoring Engine'}
        </span>
      </div>
    </div>
  )
}
