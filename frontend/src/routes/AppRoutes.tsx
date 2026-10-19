import { Routes, Route, Navigate } from 'react-router-dom'
import Dashboard from '../pages/Dashboard'
import NewAnalysis from '../pages/NewAnalysis'
import UploadResume from '../pages/UploadResume'
import AnalysisProcessing from '../pages/AnalysisProcessing'
import AnalysisResult from '../pages/AnalysisResult'
import History from '../pages/History'
import Analytics from '../pages/Analytics'
import Settings from '../pages/Settings'
import BatchAnalysis from '../pages/BatchAnalysis'
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/upload" element={<UploadResume />} />
      <Route path="/new-analysis" element={<NewAnalysis />} />
      <Route path="/processing/:id" element={<AnalysisProcessing />} />
      <Route path="/analysis/:id" element={<AnalysisResult />} />
      <Route path="/history" element={<History />} />
      <Route path="/resumes" element={<History />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/batch-analysis" element={<BatchAnalysis />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
