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
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      processFile(file)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
            ? 'border-purple-500 bg-purple-100/50 scale-[1.01] shadow-lg'
            : selectedFile
            ? 'border-purple-300 bg-purple-50/40'
            : 'border-purple-200/80 bg-purple-50/20 hover:border-purple-400 hover:bg-purple-50/50 hover:shadow-sm',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {!selectedFile ? (
          <>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-pink-500 text-white shadow-md mb-5 animate-float">
              <UploadCloud className="h-8 w-8" />
            </div>

            <h3 className="text-xl font-bold tracking-tight text-slate-900">
              Drop your {pdfOnly ? 'resume PDF' : 'resume file'} here
            </h3>
            <p className="text-sm text-slate-600 mt-1.5 max-w-sm">
              or click to browse from your computer. Our AI will instantly extract candidate skills, work history, and match scores.
            </p>

            <div className="flex items-center gap-2 mt-5">
              {(pdfOnly ? ['PDF'] : ['PDF', 'DOC', 'DOCX', 'TXT']).map((ext) => (
                <span
                  key={ext}
                  className="rounded-lg bg-white/80 border border-slate-200/80 px-2.5 py-1 text-xs font-semibold text-slate-600 shadow-2xs"
                >
                  {ext}
                </span>
              ))}
            </div>

            <div className="mt-6">
              <Button variant="primary" size="md" type="button" onClick={(e) => { e.stopPropagation(); triggerBrowse(); }}>
                <UploadCloud className="h-4 w-4" />
                <span>Select Resume File</span>
              </Button>
            </div>
          </>
        ) : (
          <div className="w-full max-w-md bg-white rounded-2xl p-6 border border-purple-200 shadow-sm text-left">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 truncate max-w-[220px]">
                    {selectedFile.name}
                  </h4>
                  <p className="text-xs text-slate-600">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Selected, ready to upload
                  </p>
                </div>
              </div>

              {!isUploading && (
                <button
                  type="button"
                  onClick={clearFile}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-lg hover:bg-slate-100"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <p className="mt-3 flex items-center gap-2 rounded-xl border border-purple-100 bg-purple-50 p-2.5 text-xs font-medium text-purple-700">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span>The resume will be uploaded when you submit both files for analysis.</span>
            </p>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-xs font-medium text-rose-600">
          {error}
        </p>
      )}

      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-slate-600 font-medium">
        <span className="flex items-center gap-1.5">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          SOC2 Compliant & Encrypted
        </span>
        <span className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-purple-600" />
          AI Skill Scoring Engine
        </span>
      </div>
    </div>
  )
}
