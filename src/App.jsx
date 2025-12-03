import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Layout from './components/Layout'
import LandingPage from './pages/LandingPage'
import SignupPage from './pages/SignupPage'
import AboutPage from './pages/AboutPage'
import JobsPage from './pages/JobsPage'
import JobDetailsPage from './pages/JobDetailsPage'
import ContactPage from './pages/ContactPage'
import TestPage from './pages/TestPage'
import Dashboard from './pages/Dashboard'
import ProfilePage from './pages/ProfilePage'
import ResumePage from './pages/ResumePage'
import SettingsPage from './pages/SettingsPage'
import ResumeEditor from './pages/ResumeEditor'
import InterviewPage from './pages/InterviewPage'
import TrackerPage from './pages/TrackerPage'
import AutoFillPage from './pages/AutoFillPage'


// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-400"></div>
      </div>
    )
  }

  return user ? children : <Navigate to="/" replace />
}

import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/landing" element={<Layout><LandingPage /></Layout>} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/about" element={<Layout><AboutPage /></Layout>} />
          <Route path="/contact" element={<Layout><ContactPage /></Layout>} />
          <Route path="/test" element={<TestPage />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/jobs" element={
            <ProtectedRoute>
              <JobsPage />
            </ProtectedRoute>
          } />
          <Route path="/jobs/:jobId" element={
            <ProtectedRoute>
              <JobDetailsPage />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/resume" element={
            <ProtectedRoute>
              <ResumePage />
            </ProtectedRoute>
          } />
          <Route path="/resume/editor" element={
            <ProtectedRoute>
              <ResumeEditor />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          } />
          <Route path="/interview" element={
            <ProtectedRoute>
              <InterviewPage />
            </ProtectedRoute>
          } />
          <Route path="/tracker" element={
            <ProtectedRoute>
              <TrackerPage />
            </ProtectedRoute>
          } />
          <Route path="/auto-fill" element={
            <ProtectedRoute>
              <AutoFillPage />
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
