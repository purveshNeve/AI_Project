export type { AnalysisStats } from './analysis'
export type ParsingStatus = 'parsed' | 'processing' | 'failed' | 'new'
export type RiskLevel = 'low' | 'medium' | 'high'

export interface WorkExperience {
  id: string
  title: string
  company: string
  duration: string
  location?: string
  description?: string
  achievements?: string[]
}

export interface Education {
  id: string
  degree: string
  institution: string
  year: string
  gpa?: string
}

export interface RiskSignal {
  id: string
  level: RiskLevel
  title: string
  description: string
}

export interface CandidateResume {
  id: string
  fileName: string
  fileSize?: string
  candidateName: string
  jobTitle: string
  email: string
  phone: string
  location: string
  linkedin?: string
  github?: string
  summary: string
  skills: string[]
  matchedSkills: string[]
  missingSkills: string[]
  experienceYears?: number
  overallScore?: number // 0-100 AI Match Score
  status: ParsingStatus
  createdAt: string
  workHistory: WorkExperience[]
  education: Education[]
  riskSignals: RiskSignal[]
  aiInsights: string[]
  confidenceScore?: number // e.g. 96%
}

export interface JobTarget {
  title: string
  department?: string
  requiredSkills: string[]
  minExperienceYears: number
  description?: string
}

export interface ResumeUploadPayload {
  file: File
  jobTarget?: JobTarget
}
