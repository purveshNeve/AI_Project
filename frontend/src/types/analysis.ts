import type { ParsingStatus } from './resume'

export interface AnalysisStats {
  totalResumes: number
  successfullyParsed: number
  processingCount: number
  failedCount: number
  avgMatchScore: number
  accuracyRate: number
  topSkills: { name: string; count: number; percentage: number }[]
}

export interface ProcessingStep {
  id: string
  name: string
  status: 'completed' | 'in_progress' | 'pending'
  detail?: string
}

export interface AnalysisFilter {
  searchQuery?: string
  status?: ParsingStatus | 'all'
  minScore?: number
  sortBy?: 'date' | 'score' | 'name'
  sortOrder?: 'asc' | 'desc'
}
