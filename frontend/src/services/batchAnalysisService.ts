
import { apiClient } from './api'

export interface BatchCreateResponse {
  batch_id: number
  status: string
  total_resumes: number
  processed_resumes: number
  failed_resumes: number
}

export interface BatchSummary {
  batch_id: number
  job_description_filename: string
  status: string
  total_resumes: number
  processed_resumes: number
  failed_resumes: number
  created_at: string | null
  completed_at: string | null
}

export interface RequirementResult {
  requirement: string
  score: number
  match_level: string
  supporting_evidence?: Array<{
    chunk_id: string
    text: string
    section: string
    similarity_score: number
  }>
}

export interface BatchResumeResult {
  result_id: number
  resume_id: number
  candidate_name: string | null
  filename: string | null
  status: string
  overall_score: number | null
  requirements: RequirementResult[]
  error_message: string | null
  completed_at: string | null
  rank: number | null
}

export interface BatchResultsResponse {
  batch_id: number
  status: string
  results: BatchResumeResult[]
}

export const batchAnalysisService = {
  async createBatch(
    resumeIds: string[],
    jobDescription: File,
  ): Promise<BatchCreateResponse> {
    const formData = new FormData()

    resumeIds.forEach((id) => {
      formData.append('resume_ids', id)
    })

    formData.append('job_description', jobDescription)

    const response = await apiClient.post<BatchCreateResponse>(
      '/batches/',
      formData,
      { timeout: 600000 },
    )

    return response.data
  },

  async getBatches(): Promise<BatchSummary[]> {
    const response = await apiClient.get<BatchSummary[]>('/batches/')
    return response.data
  },

  async getBatch(batchId: number): Promise<BatchSummary> {
    const response = await apiClient.get<BatchSummary>(
      `/batches/${batchId}`,
    )
    return response.data
  },

  async getBatchResults(
    batchId: number,
  ): Promise<BatchResultsResponse> {
    const response = await apiClient.get<BatchResultsResponse>(
      `/batches/${batchId}/results`,
      { timeout: 60000 },
    )

    return response.data
  },
}
