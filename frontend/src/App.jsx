import React, { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import LandingPage from './components/LandingPage'
import Dashboard from './components/Dashboard'
import UploadModal from './components/UploadModal'
import ResultsPage from './components/ResultsPage'
import { SAMPLE_REPORTS } from './data/sampleReports'
import { checkHealth } from './services/api'

export default function App() {
  const [currentView, setCurrentView] = useState('landing') // 'landing' | 'dashboard' | 'results'
  const [reportsList, setReportsList] = useState(SAMPLE_REPORTS)
  const [selectedReport, setSelectedReport] = useState(SAMPLE_REPORTS[0])
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isEmptyState, setIsEmptyState] = useState(false)
  const [backendStatus, setBackendStatus] = useState({ online: false, tesseract: false })

  useEffect(() => {
    const probe = async () => {
      try {
        const res = await checkHealth()
        if (res && res.status === 'healthy') {
          setBackendStatus({ online: true, tesseract: Boolean(res.tesseract_available) })
        }
      } catch (e) {
        setBackendStatus({ online: false, tesseract: false })
      }
    }
    probe()
    const timer = setInterval(probe, 15000)
    return () => clearInterval(timer)
  }, [])

  const handleSelectReport = (report) => {
    setSelectedReport(report)
    setCurrentView('results')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleUploadSuccess = (newReport) => {
    // Add newly analyzed report to dashboard
    setReportsList(prev => [newReport, ...prev])
    setIsEmptyState(false)
    setSelectedReport(newReport)
    setCurrentView('results')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-teal-100 selection:text-teal-900">
      {/* App Top Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        backendStatus={backendStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'landing' && (
          <LandingPage
            onGoToDashboard={() => {
              setCurrentView('dashboard')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onSelectReport={handleSelectReport}
            sampleReports={reportsList}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard
            reports={reportsList}
            onSelectReport={handleSelectReport}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            isEmptyState={isEmptyState}
            setIsEmptyState={setIsEmptyState}
          />
        )}

        {currentView === 'results' && (
          <ResultsPage
            report={selectedReport}
            onBackToDashboard={() => {
              setCurrentView('dashboard')
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
            onOpenUpload={() => setIsUploadModalOpen(true)}
          />
        )}
      </main>

      {/* Upload & Validation Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
        sampleReports={SAMPLE_REPORTS}
      />

      {/* Accessible Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 mt-16 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm">ReportSaathi</span>
            <span className="text-slate-300">&bull;</span>
            <span className="font-medium text-slate-600">Patient-First Health Literacy Companion</span>
          </div>

          <div className="text-center sm:text-right text-[11px] text-slate-400 max-w-md">
            FastAPI & Tesseract OCR Backend Connected &bull; Non-diagnostic educational tool &bull; Consult your healthcare provider.
          </div>
        </div>
      </footer>
    </div>
  )
}
