import { ResumeService } from './resumeService'
import { apiClient } from './api'
import type { CandidateResume, AnalysisStats } from '../types/resume'

export interface AnalysisUploadResponse {
  message: string
  resume: { filename: string; size: number }
  resume_id: string
  stored_resume_chunks: number
  resume_raw_text: string
  resume_structured: {
    contact: { email: string | null; phone: string | null }
    skills: string[]
    sections: Record<string, string[]>
  }
  job_description: { filename: string; size: number }
  job_description_raw_text: string
  job_description_structured: {
    job_title: string | null
    required_skills: string[]
    minimum_experience_years: number | null
    sections: Record<string, string[]>
  }
  overall_score: number
  requirements: Array<{
    requirement: string
    score: number
    match_level: string
    supporting_evidence: Array<{
      chunk_id: string
      text: string
      section: string
      similarity_score: number
    }>
  }>
}

export const analysisService = {
  async getDashboardData(): Promise<{ stats: AnalysisStats; recentResumes: CandidateResume[] }> {
    const stats = await ResumeService.getStats()
    const resumes = await ResumeService.getResumes()
    return { stats, recentResumes: resumes.slice(0, 5) }
  },

  async getAllResumes(): Promise<CandidateResume[]> {
    return ResumeService.getResumes()
  },

  async getResume(id: string): Promise<CandidateResume | undefined> {
    return ResumeService.getResumeById(id)
  },

  async parseResume(file: File): Promise<CandidateResume> {
    return ResumeService.uploadAndParse(file)
  },

  async uploadAnalysisFiles(
    resumeFile: File,
    jobDescriptionFile: File,
  ): Promise<AnalysisUploadResponse> {
    const formData = new FormData()
    formData.append('resume', resumeFile)
    formData.append('job_description', jobDescriptionFile)

    const response = await apiClient.post<AnalysisUploadResponse>(
      '/analysis/upload',
      formData,
      { timeout: 120000 },
    )
    return response.data
  },

  async deleteResume(id: string): Promise<boolean> {
    return ResumeService.deleteResume(id)
  }
}