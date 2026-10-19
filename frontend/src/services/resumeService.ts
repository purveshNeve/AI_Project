
import { apiClient } from './api'
import type { CandidateResume } from '../types/resume'
import type { AnalysisStats } from '../types/analysis'

interface ApiSkill {
  id: number
  name: string
  category?: string | null
}

interface ApiExperience {
  id: number
  company?: string | null
  job_title?: string | null
  start_date?: string | null
  end_date?: string | null
  description?: string | null
}

interface ApiEducation {
  id: number
  institution?: string | null
  degree?: string | null
  field_of_study?: string | null
  graduation_year?: number | string | null
}

interface ApiResume {
  id: number
  full_name?: string | null
  email?: string | null
  phone?: string | null
  linkedin_url?: string | null
  github_url?: string | null
  portfolio_url?: string | null
  location?: string | null
  professional_title?: string | null
  summary?: string | null
  original_filename?: string | null
  created_at?: string | null
  skills?: ApiSkill[]
  experiences?: ApiExperience[]
  education?: ApiEducation[]
}

interface ApiUploadResponse {
  message: string
  resume_id: number
  full_name?: string | null
  email?: string | null
  phone?: string | null
  skills?: string[]
  created_at?: string | null
}

function mapResume(resume: ApiResume): CandidateResume {
  const skills = (resume.skills ?? []).map((skill) => skill.name)

  return {
    id: String(resume.id),
    fileName: resume.original_filename || 'Resume.pdf',
    candidateName: resume.full_name || 'Name not detected',
    jobTitle: resume.professional_title || 'Not specified',
    email: resume.email || '',
    phone: resume.phone || '',
    location: resume.location || 'Not specified',
    linkedin: resume.linkedin_url || undefined,
    github: resume.github_url || undefined,
    summary: resume.summary || '',
    skills,
    matchedSkills: [],
    missingSkills: [],
    status: 'parsed',
    createdAt: resume.created_at || '',
    workHistory: (resume.experiences ?? []).map((item) => ({
      id: String(item.id),
      title: item.job_title || 'Role not specified',
      company: item.company || 'Company not specified',
      duration: [item.start_date, item.end_date]
        .filter(Boolean)
        .join(' - ') || 'Dates not specified',
      description: item.description || '',
    })),
    education: (resume.education ?? []).map((item) => ({
      id: String(item.id),
      degree: [item.degree, item.field_of_study]
        .filter(Boolean)
        .join(' - ') || 'Degree not specified',
      institution: item.institution || 'Institution not specified',
      year: item.graduation_year ? String(item.graduation_year) : 'Not specified',
    })),
    riskSignals: [],
    aiInsights: [],
  }
}

export class ResumeService {
  static async getResumes(): Promise<CandidateResume[]> {
    const response = await apiClient.get<ApiResume[]>('/resumes/')
    return response.data.map(mapResume)
  }

  static async getResumeById(
    id: string,
  ): Promise<CandidateResume | undefined> {
    try {
      const response = await apiClient.get<ApiResume>(
        `/resumes/${encodeURIComponent(id)}`,
      )
      return mapResume(response.data)
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        (error as { response?: { status?: number } }).response?.status === 404
      ) {
        return undefined
      }
      throw error
    }
  }

  static async getStats(): Promise<AnalysisStats> {
    const resumes = await this.getResumes()
    const skillCounts = new Map<string, number>()

    for (const resume of resumes) {
      for (const skill of resume.skills) {
        const normalized = skill.trim()
        if (normalized) {
          skillCounts.set(
            normalized,
            (skillCounts.get(normalized) ?? 0) + 1,
          )
        }
      }
    }

    const topSkills = [...skillCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({
        name,
        count,
        percentage: resumes.length
          ? Math.round((count / resumes.length) * 100)
          : 0,
      }))

    return {
      totalResumes: resumes.length,
      successfullyParsed: resumes.length,
      processingCount: 0,
      failedCount: 0,
      avgMatchScore: null,
      accuracyRate: 0,
      topSkills,
    }
  }

  static async uploadAndParse(file: File): Promise<CandidateResume> {
    const formData = new FormData()
    formData.append('resume', file)

    const response = await apiClient.post<ApiUploadResponse>(
      '/resumes/upload',
      formData,
      { timeout: 120000 },
    )

    return {
      id: String(response.data.resume_id),
      fileName: file.name,
      candidateName: response.data.full_name || 'Name not detected',
      jobTitle: 'Not specified',
      email: response.data.email || '',
      phone: response.data.phone || '',
      location: 'Not specified',
      summary: '',
      skills: response.data.skills ?? [],
      matchedSkills: [],
      missingSkills: [],
      status: 'parsed',
      createdAt: response.data.created_at || '',
      workHistory: [],
      education: [],
      riskSignals: [],
      aiInsights: [],
      fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
    }
  }

  static async deleteResume(id: string): Promise<boolean> {
    await apiClient.delete(`/resumes/${encodeURIComponent(id)}`)
    return true
  }
}
