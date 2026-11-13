import React, { useState } from 'react'
import { 
  ArrowLeft, 
  Printer, 
  Copy, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight, 
  MessageSquare, 
  Apple, 
  Search, 
  Sparkles, 
  FileCheck2,
  Info,
  ShieldAlert,
  Bot
} from 'lucide-react'
import DisclaimerBanner from './DisclaimerBanner'

export default function ResultsPage({ report, onBackToDashboard, onOpenUpload }) {
  if (!report) return null

  const [activeTab, setActiveTab] = useState('biomarkers') // 'biomarkers' | 'rawText'
  const [filter, setFilter] = useState('all') // 'all' | 'attention' | 'normal'
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedQuestions, setCopiedQuestions] = useState(false)

  const biomarkers = report.biomarkers || []
  const attentionCount = biomarkers.filter(b => b.status === 'high' || b.status === 'low' || b.status === 'borderline').length
  const normalCount = biomarkers.filter(b => b.status === 'normal').length

  const filteredBiomarkers = biomarkers.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.explanation && b.explanation.toLowerCase().includes(searchQuery.toLowerCase()))
    if (!matchesSearch) return false
    if (filter === 'attention') return b.status === 'high' || b.status === 'low' || b.status === 'borderline'
    if (filter === 'normal') return b.status === 'normal'
    return true
  })

  const handleCopyQuestions = () => {
    if (!report.doctorQuestions) return
    const text = `Questions for my physician regarding my ${report.title}:\n\n` +
      report.doctorQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')
    navigator.clipboard.writeText(text)
    setCopiedQuestions(true)
    setTimeout(() => setCopiedQuestions(false), 2000)
  }

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'prompt_attention':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Prompt Doctor Review Recommended
          </span>
        )
      case 'follow_up_recommended':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Routine Follow-Up Advised
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Standard Routine Review
          </span>
        )
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'high':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
            <ArrowUpRight className="w-3 h-3 text-amber-700" /> Above In-Doc Range
          </span>
        )
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-300">
            <ArrowDownRight className="w-3 h-3 text-blue-700" /> Below In-Doc Range
          </span>
        )
      case 'borderline':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-900 border border-yellow-300">
            <AlertCircle className="w-3 h-3 text-yellow-700" /> Borderline
          </span>
        )
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" /> Normal
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            No Range in Document
          </span>
        )
    }
  }

  return (
    <div className="space-y-8 py-4">
      {/* Navigation Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBackToDashboard}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-teal-700 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print Report
          </button>
          <button
            onClick={onOpenUpload}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-colors"
          >
            Upload Another
          </button>
        </div>
      </div>

      {/* Report Identity Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200/60 px-2 py-0.5 rounded-md">
                {report.category}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{report.title}</h1>
            </div>
            <p className="text-xs text-slate-500">
              Lab: <strong className="text-slate-700">{report.labName}</strong> &bull; {report.date}
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5 self-start sm:self-center">
            {getUrgencyBadge(report.urgencyLevel)}
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Bot className="w-3 h-3 text-teal-600" />
              {report.geminiLiveUsed ? 'Interpreted via Gemini 2.5 Flash' : 'Grounded Educational Engine'}
            </span>
          </div>
        </div>

        {/* Patient Metadata Chips */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-4 sm:gap-8 text-xs text-slate-600">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Document Reference</span>
            <span className="font-mono text-slate-800">{report.patient?.id || 'DOC-REF'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Tests Isolated</span>
            <span className="font-bold text-teal-700">{biomarkers.length} Parameters</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Extraction Method</span>
            <span className="font-bold text-slate-800 uppercase">{report.extractionMethod || 'Hybrid OCR'}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Clinical Certainty</span>
            <span className="font-bold text-amber-700">Non-Diagnostic Aid</span>
          </div>
        </div>
      </div>

      {/* Document Clarity Warning Banner (When applicable) */}
      {report.clarityWarning && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-5 rounded-r-2xl text-amber-950 shadow-sm border border-amber-200">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm space-y-1">
              <h4 className="font-bold text-amber-950">Notice Regarding Document Clarity</h4>
              <p className="text-amber-900 leading-relaxed">{report.clarityWarning}</p>
              <p className="text-amber-800 font-semibold text-xs pt-1">
                Recommendation: Please present your original physical report directly to a qualified clinician.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mandatory Medical Disclaimer */}
      <DisclaimerBanner />

      {/* Plain-Language Executive Summary */}
      <div className="bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-teal-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-teal-400" />
            <span>AI Plain-Language Educational Summary</span>
          </div>
          <span className="text-[10px] font-semibold bg-teal-800/80 text-teal-200 px-2 py-0.5 rounded-full">
            Non-Diagnostic
          </span>
        </div>
        <p className="text-sm sm:text-base leading-relaxed text-teal-50 font-normal mb-6">
          {report.overallSummary}
        </p>

        {/* Key Observations List */}
        {report.keyFindings && report.keyFindings.length > 0 && (
          <div className="pt-6 border-t border-teal-800/60">
            <h3 className="text-xs font-bold text-teal-300 uppercase tracking-wider mb-3">
              Observations at a Glance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {report.keyFindings.map((finding, idx) => (
                <div 
                  key={idx} 
                  className="bg-teal-900/40 border border-teal-700/40 rounded-xl p-3 text-xs text-teal-100 flex items-start gap-2.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0 mt-1.5"></span>
                  <span className="leading-relaxed">{finding}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Biomarkers Section: Distinguishing Source Facts vs AI Explanations */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Section Header & View Tabs */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Extracted Biomarkers & Explanations</h2>
              <span className="text-[10px] font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                Separated Facts & AI Insights
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Source facts are extracted verbatim. Explanations provide neutral educational context.
            </p>
          </div>

          {/* Tab Switcher: Biomarkers vs Raw Text */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('biomarkers')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'biomarkers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Biomarkers ({biomarkers.length})
            </button>
            <button
              onClick={() => setActiveTab('rawText')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'rawText' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Raw Document Text
            </button>
          </div>
        </div>

        {activeTab === 'biomarkers' ? (
          <div>
            {/* Filter & Search Bar */}
            <div className="p-4 sm:px-6 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by test name (e.g. Hemoglobin, Glucose)..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800"
                />
              </div>

              {/* Status Filters */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    filter === 'all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  All ({biomarkers.length})
                </button>
                <button
                  onClick={() => setFilter('attention')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    filter === 'attention' ? 'bg-amber-600 text-white' : 'bg-white text-amber-800 border border-amber-200 hover:bg-amber-50'
                  }`}
                >
                  Out of Range ({attentionCount})
                </button>
                <button
                  onClick={() => setFilter('normal')}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                    filter === 'normal' ? 'bg-emerald-600 text-white' : 'bg-white text-emerald-800 border border-emerald-200 hover:bg-emerald-50'
                  }`}
                >
                  Normal ({normalCount})
                </button>
              </div>
            </div>

            {/* Biomarker List: Clear Separation of Source Facts & AI Explanations */}
            <div className="divide-y divide-slate-100">
              {filteredBiomarkers.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  No biomarkers match your search or filter.
                </div>
              ) : (
                filteredBiomarkers.map((b, idx) => (
                  <div key={idx} className="p-5 sm:p-6 hover:bg-slate-50/60 transition-colors">
                    {/* Top Row: Name, Status, and Source Facts */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base">{b.name}</h3>
                          {getStatusBadge(b.status)}
                        </div>
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <FileCheck2 className="w-3 h-3 text-slate-400" />
                          Source-Extracted Fact
                        </span>
                      </div>

                      {/* Extracted Facts Box */}
                      <div className="flex items-center gap-4 bg-slate-100/80 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-mono self-start sm:self-auto">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase block font-sans font-semibold">Observed Value</span>
                          <span className="font-black text-slate-900 text-sm">
                            {b.value} <span className="font-normal text-xs text-slate-500">{b.unit}</span>
                          </span>
                        </div>
                        <div className="border-l border-slate-300 pl-4">
                          <span className="text-[10px] text-slate-400 uppercase block font-sans font-semibold">In-Document Reference Range</span>
                          <span className={`text-xs font-medium ${b.referenceRange && b.referenceRange !== 'Not specified in report' ? 'text-slate-800' : 'text-amber-700 italic'}`}>
                            {b.referenceRange || 'Not specified in report'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* AI Educational Explanation Box */}
                    <div className="bg-teal-50/50 border border-teal-200/70 rounded-2xl p-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-teal-800 uppercase tracking-wider mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        <span>AI Educational Explanation</span>
                      </div>
                      <p>{b.explanation}</p>

                      {/* Clarity / Missing Info Note (if present) */}
                      {b.clarityNote && (
                        <div className="mt-2.5 pt-2 border-t border-teal-200/60 flex items-start gap-1.5 text-xs text-amber-900 bg-amber-50/80 p-2 rounded-xl">
                          <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <span><strong>Note:</strong> {b.clarityNote}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* RAW EXTRACTED TEXT TAB */
          <div className="p-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Verbatim Extracted Text (PyMuPDF / Tesseract OCR Output)
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(report.rawExtractedText)
                  alert('Raw text copied to clipboard!')
                }}
                className="text-xs text-teal-700 hover:underline flex items-center gap-1 font-semibold"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Verbatim Text
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-100 rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed whitespace-pre-wrap">
              {report.rawExtractedText}
            </pre>
          </div>
        )}
      </div>

      {/* Two Column Section: Doctor Questions & General Wellness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Questions for Doctor Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-teal-600" />
                Empowering Questions for Your Doctor
              </h3>
              <button
                onClick={handleCopyQuestions}
                className="text-xs flex items-center gap-1.5 font-bold text-teal-700 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200/80 transition-colors"
                title="Copy all questions"
              >
                {copiedQuestions ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy List
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Use these non-diagnostic discussion prompts to actively collaborate with your physician:
            </p>
            <ul className="space-y-3">
              {(report.doctorQuestions || []).map((q, idx) => (
                <li 
                  key={idx} 
                  className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 bg-slate-50 p-3 rounded-2xl border border-slate-200/80"
                >
                  <span className="w-5 h-5 rounded-full bg-teal-100 text-teal-800 font-extrabold flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* General Lifestyle & Nutrition Context Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-7 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Apple className="w-5 h-5 text-emerald-600" />
              General Wellness & Context
            </h3>
            <p className="text-xs text-slate-500 mb-5 leading-relaxed">
              Standard non-clinical lifestyle considerations relevant to baseline health:
            </p>
            <ul className="space-y-3">
              {(report.wellnessNotes || [
                'Maintain consistent daily hydration unless medically restricted by your doctor.',
                'Ensure balanced intake of dietary fiber, whole foods, and colorful vegetables.',
                'Prioritize 7-8 hours of restful sleep prior to any repeat laboratory tests.'
              ]).map((note, idx) => (
                <li 
                  key={idx} 
                  className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 bg-emerald-50/40 p-3 rounded-2xl border border-emerald-100/80"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-2"></span>
                  <span className="leading-relaxed">{note}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] text-slate-400 mt-6 pt-4 border-t border-slate-100">
            *Lifestyle context is strictly non-prescriptive. Always consult your qualified clinician before initiating any diet, supplement, or health regimen.
          </p>
        </div>
      </div>
    </div>
  )
}
