import React, { useState, useRef } from 'react'
import { 
  X, 
  UploadCloud, 
  FileText, 
  Image as ImageIcon, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  RotateCcw
} from 'lucide-react'
import { analyzeReportUpload } from '../services/api'

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
const ALLOWED_EXTENSIONS = ['.pdf', '.png', '.jpg', '.jpeg']

export default function UploadModal({ isOpen, onClose, onUploadSuccess, sampleReports }) {
  if (!isOpen) return null

  // Flow states: 'idle' | 'loading' | 'success' | 'error'
  const [modalState, setModalState] = useState('idle')
  const [selectedFile, setSelectedFile] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [progressStep, setProgressStep] = useState(0)
  const fileInputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)

  const loadingSteps = [
    'Validating document format and disk integrity...',
    'Running PyMuPDF text extractor / Tesseract OCR engine...',
    'Consulting Gemini AI with strict medical safety guardrails...',
    'Structuring plain-language summary & physician consultation notes...'
  ]

  const validateFile = (file) => {
    setErrorMessage('')
    
    // 1. Check file type
    const fileExt = '.' + file.name.split('.').pop().toLowerCase()
    const isValidType = ALLOWED_MIME_TYPES.includes(file.type) || ALLOWED_EXTENSIONS.includes(fileExt)
    if (!isValidType) {
      setErrorMessage(`Unsupported file format "${fileExt}". Only PDF (.pdf), PNG (.png), and JPG (.jpg, .jpeg) documents are supported.`)
      setModalState('error')
      return false
    }

    // 2. Check file size
    if (file.size === 0) {
      setErrorMessage('The selected file is empty (0 bytes). Please choose a valid document.')
      setModalState('error')
      return false
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1)
      setErrorMessage(`File size (${sizeMB} MB) exceeds maximum allowed limit of 10 MB. Please compress or crop the file.`)
      setModalState('error')
      return false
    }

    return true
  }

  const handleFile = (file) => {
    if (!file) return
    if (validateFile(file)) {
      setSelectedFile(file)
      setModalState('idle')
      setErrorMessage('')
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  // Real API call to FastAPI backend
  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) return
    setModalState('loading')
    setProgressStep(0)

    const stepInterval = setInterval(() => {
      setProgressStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev))
    }, 600)

    try {
      const apiResponse = await analyzeReportUpload(selectedFile)
      clearInterval(stepInterval)

      // Transform backend response to UI Report format
      const biomarkers = (apiResponse.detected_biomarkers || []).map((b) => {
        const source = b.source_facts || b
        const ai = b.ai_explanation || b
        return {
          name: source.test_name || b.test_name,
          value: source.extracted_value || b.observed_value || b.value,
          unit: source.unit || b.unit || '',
          referenceRange: source.reference_range || b.reference_range || 'Not specified in report',
          status: ai.status_indicator || b.status || 'unclassified',
          explanation: ai.simple_language_explanation || b.educational_note || b.explanation,
          clarityNote: ai.clarity_note || b.clarity_note || null
        }
      })

      const hasAttention = biomarkers.some(b => b.status === 'high' || b.status === 'low')

      const formattedReport = {
        id: `rep-${Date.now()}`,
        title: `Analysis: ${apiResponse.filename}`,
        category: apiResponse.extraction_method.includes('pdf') ? 'PDF Document' : 'Image Scan',
        patient: {
          name: 'Patient Document',
          age: 'Record',
          gender: apiResponse.extraction_method.toUpperCase(),
          id: `DOC-${Math.floor(1000 + Math.random() * 9000)}`
        },
        labName: `Extracted via ${apiResponse.extraction_method}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        urgencyLevel: hasAttention ? 'follow_up_recommended' : 'routine',
        geminiLiveUsed: Boolean(apiResponse.gemini_live_used),
        isReportClear: Boolean(apiResponse.is_report_clear),
        clarityWarning: apiResponse.clarity_warning || null,
        overallSummary: apiResponse.overall_summary || apiResponse.educational_summary || 'Your laboratory report text was extracted and summarized below.',
        keyFindings: biomarkers.length > 0 
          ? biomarkers.map(b => `${b.name}: ${b.value} ${b.unit} (${b.status === 'normal' ? 'Within In-Document Range' : b.status === 'high' ? 'Above Range' : b.status === 'low' ? 'Below Range' : 'No Reference Range Stated'})`)
          : ['Text extracted successfully. Individual standard metrics are detailed in the raw transcript below.'],
        biomarkers: biomarkers,
        doctorQuestions: apiResponse.doctor_questions || [
          'How do these results correlate with my current symptoms or clinical history?',
          'Would you recommend repeat testing or any baseline lifestyle adjustments?'
        ],
        wellnessNotes: [
          'Review all findings with your physician before making dietary or lifestyle changes.',
          'Maintain regular hydration and restful sleep habits prior to follow-up testing.'
        ],
        rawExtractedText: apiResponse.extracted_text,
        extractionMethod: apiResponse.extraction_method,
        pageCount: apiResponse.page_count
      }

      setModalState('success')
      setTimeout(() => {
        onUploadSuccess(formattedReport)
        handleReset()
        onClose()
      }, 700)
    } catch (err) {
      clearInterval(stepInterval)
      setModalState('error')
      const detail = err.response?.data?.detail || err.message || 'An error occurred during extraction. Please try again.'
      setErrorMessage(detail)
    }
  }

  const handlePickSample = (sample) => {
    setModalState('loading')
    setProgressStep(0)
    const t = setInterval(() => {
      setProgressStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev))
    }, 400)

    setTimeout(() => {
      clearInterval(t)
      setModalState('success')
      setTimeout(() => {
        onUploadSuccess(sample)
        handleReset()
        onClose()
      }, 500)
    }, 1500)
  }

  const handleSimulateError = () => {
    setModalState('error')
    setErrorMessage('Unreadable File: The document appears blank or blurry. Tesseract OCR detected 0 characters. Please upload a clear document.')
  }

  const handleReset = () => {
    setSelectedFile(null)
    setErrorMessage('')
    setModalState('idle')
    setProgressStep(0)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Upload Laboratory Report</h2>
              <p className="text-[11px] text-slate-400">PDF, JPG, or PNG files up to 10 MB</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {modalState === 'loading' ? (
            /* LOADING STATE */
            <div className="py-8 text-center space-y-6">
              <div className="relative w-16 h-16 mx-auto">
                <div className="w-16 h-16 rounded-full border-4 border-teal-100 border-t-teal-600 animate-spin" />
                <Sparkles className="w-6 h-6 text-teal-600 absolute inset-0 m-auto animate-pulse" />
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 mb-1">FastAPI Backend & Gemini Processing</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  {loadingSteps[progressStep]}
                </p>
              </div>

              {/* Progress Stepper Bars */}
              <div className="w-full bg-slate-100 rounded-full h-2 max-w-xs mx-auto overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((progressStep + 1) / loadingSteps.length) * 100}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 font-medium">Step {progressStep + 1} of 4</p>
            </div>
          ) : modalState === 'success' ? (
            /* SUCCESS STATE */
            <div className="py-10 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-in zoom-in duration-300">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Analysis Complete!</h3>
                <p className="text-xs text-slate-500">Opening structured biomarker analysis...</p>
              </div>
            </div>
          ) : modalState === 'error' ? (
            /* ERROR STATE */
            <div className="py-6 space-y-5">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider">Processing Error</h4>
                  <p className="text-xs leading-relaxed text-rose-800">{errorMessage}</p>
                </div>
              </div>

              <div className="text-xs text-slate-500 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <p className="font-semibold text-slate-700 mb-1">Upload Requirements:</p>
                <ul className="list-disc pl-4 space-y-1 text-slate-600">
                  <li>Accepted formats: strictly PDF, PNG, or JPG.</li>
                  <li>Maximum file size: 10 MB.</li>
                  <li>Ensure document is not password-protected or blank.</li>
                </ul>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Try Again
                </button>
                <button
                  type="button"
                  onClick={() => handlePickSample(sampleReports[0])}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-sm"
                >
                  Load Sample Report
                </button>
              </div>
            </div>
          ) : (
            /* IDLE STATE: DRAG & DROP ZONE */
            <div className="space-y-5">
              {!selectedFile ? (
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                    dragActive
                      ? 'border-teal-500 bg-teal-50/60 scale-[1.01]'
                      : 'border-slate-300 hover:border-teal-500 hover:bg-slate-50/60'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => e.target.files && handleFile(e.target.files[0])}
                    className="hidden"
                  />
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center mb-3">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-800 mb-1">
                    Drag and drop your report, or <span className="text-teal-700 underline">browse files</span>
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mb-3">
                    Supported: PDF (digital or scanned), JPG, and PNG (up to 10 MB)
                  </p>
                  <span className="inline-block text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                    Validated by FastAPI &bull; Tesseract OCR &bull; Gemini AI Safety Rules
                  </span>
                </div>
              ) : (
                /* Selected File Card */
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                      {selectedFile.name.endsWith('.pdf') ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 line-clamp-1">{selectedFile.name}</p>
                      <p className="text-[11px] text-slate-500">
                        {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready to send to /api/reports/analyze
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Sample Quick Selector */}
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-teal-600" />
                  Or pick a realistic demo dataset:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {sampleReports.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handlePickSample(s)}
                      className="text-left p-2.5 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 transition-all text-xs group"
                    >
                      <p className="font-bold text-slate-800 group-hover:text-teal-700 line-clamp-1">{s.title}</p>
                      <span className="text-[10px] text-slate-400 capitalize">{s.category}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleSimulateError}
                  className="text-[11px] text-slate-400 hover:text-rose-600 underline"
                  title="Test error boundary"
                >
                  Test Error Boundary
                </button>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={!selectedFile}
                    onClick={handleUploadAndAnalyze}
                    className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                      selectedFile 
                        ? 'bg-teal-600 hover:bg-teal-700 cursor-pointer' 
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    <span>Analyze Document</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
