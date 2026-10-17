import axios from 'axios'

// Base API instance for future backend connectivity
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
})
