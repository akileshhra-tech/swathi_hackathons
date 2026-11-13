import React, { useState } from 'react'
import { 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  HelpCircle, 
  Printer, 
  Share2, 
  Copy, 
  Check, 
  Heart, 
  MessageSquare, 
  Apple,
  FileCheck2,
  Filter
} from 'lucide-react'
import DisclaimerBanner from './DisclaimerBanner'

export default function ReportView({ data, onReset }) {
  const [filter, setFilter] = useState('all') // 'all' | 'attention' | 'normal'
  const [copiedQuestions, setCopiedQuestions] = useState(false)

  if (!data) return null

  const biomarkers = data.biomarkers || []
  const attentionCount = biomarkers.filter(b => b.status === 'high' || b.status === 'low' || b.status === 'borderline').length
  const normalCount = biomarkers.filter(b => b.status === 'normal').length

  const filteredBiomarkers = biomarkers.filter(b => {
    if (filter === 'attention') return b.status === 'high' || b.status === 'low' || b.status === 'borderline'
    if (filter === 'normal') return b.status === 'normal'
    return true
  })

  const handleCopyQuestions = () => {
    if (!data.questions_for_doctor) return
    const textToCopy = `Questions for my doctor regarding my lab report:\n` + 
      data.questions_for_doctor.map((q, i) => `${i + 1}. ${q}`).join('\n')
    navigator.clipboard.writeText(textToCopy)
    setCopiedQuestions(true)
    setTimeout(() => setCopiedQuestions(false), 2000)
  }

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'prompt_attention':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            Prompt Doctor Review Recommended
          </span>
        )
      case 'follow_up_recommended':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            Routine Follow-Up Advised
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
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
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <ArrowUpRight className="w-3 h-3 text-amber-600" /> High
          </span>
        )
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <ArrowDownRight className="w-3 h-3 text-blue-600" /> Low
          </span>
        )
      case 'borderline':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
            <AlertCircle className="w-3 h-3 text-yellow-600" /> Borderline
          </span>
        )
      case 'normal':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Normal
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            Inconclusive
          </span>
        )
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{data.title || 'Laboratory Report Analysis'}</h2>
            {getUrgencyBadge(data.urgency_level)}
          </div>
          <p className="text-xs text-slate-500 flex items-center gap-2">
            <FileCheck2 className="w-3.5 h-3.5 text-teal-600" />
            Extraction Method: <span className="font-medium text-slate-700 uppercase">{data.source_method || 'Hybrid OCR / Direct'}</span>
            &bull; {biomarkers.length} parameters analyzed
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Print / Save PDF
          </button>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-sm"
          >
            New Report
          </button>
        </div>
      </div>

      {/* Medical Disclaimer Banner */}
      <DisclaimerBanner />

      {/* Overall Summary Card */}
      <div className="bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 text-white rounded-2xl p-6 sm:p-8 shadow-md">
        <div className="flex items-center gap-2 text-teal-300 text-xs font-semibold uppercase tracking-wider mb-2">
          <Heart className="w-4 h-4" /> Plain-Language Executive Summary
        </div>
        <p className="text-sm sm:text-base leading-relaxed text-teal-50 font-normal">
          {data.overall_summary}
        </p>

        {/* Key Findings Pills */}
        {data.key_findings && data.key_findings.length > 0 && (
          <div className="mt-6 pt-6 border-t border-teal-700/60">
            <p className="text-xs font-semibold text-teal-200 mb-2">Key Observations at a Glance:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.key_findings.map((finding, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-teal-800/40 border border-teal-600/40 rounded-xl p-2.5 text-xs text-teal-100">
                  <span className="text-teal-400 font-bold">&bull;</span>
                  <span>{finding}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Biomarkers Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              Individual Test Explanations
            </h3>
            <p className="text-xs text-slate-500">
              Comparing your observed values against standard laboratory reference ranges
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({biomarkers.length})
            </button>
            <button
              onClick={() => setFilter('attention')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                filter === 'attention' ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-600 hover:text-amber-800'
              }`}
            >
              Needs Attention ({attentionCount})
            </button>
            <button
              onClick={() => setFilter('normal')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1 ${
                filter === 'normal' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-emerald-800'
              }`}
            >
              Normal ({normalCount})
            </button>
          </div>
        </div>

        {/* Biomarkers Grid / Cards */}
        <div className="space-y-4">
          {filteredBiomarkers.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              No biomarkers match the current filter selection.
            </div>
          ) : (
            filteredBiomarkers.map((b, idx) => (
              <div 
                key={idx}
                className="p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-teal-300 transition-all bg-slate-50/50 hover:bg-white"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 text-sm sm:text-base">{b.test_name}</span>
                    {getStatusBadge(b.status)}
                  </div>

                  <div className="flex items-baseline gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase">Your Result</span>
                      <span className="font-bold text-slate-900 text-sm">
                        {b.result_value} <span className="text-xs font-normal text-slate-500">{b.unit}</span>
                      </span>
                    </div>
                    <div className="border-l border-slate-200 pl-4">
                      <span className="text-slate-400 block text-[10px] uppercase">Normal Range</span>
                      <span className="text-slate-600 text-xs">{b.reference_range}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-100">
                  {b.explanation}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Two-Column Advice & Doctor Prep */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Questions for Doctor */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-600" />
                Questions for Your Doctor
              </h3>
              <button
                onClick={handleCopyQuestions}
                className="text-xs flex items-center gap-1 text-teal-700 hover:text-teal-800 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200 transition-colors"
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
            <p className="text-xs text-slate-500 mb-4">
              Take these discussion prompts to your next consultation to get the most out of your visit:
            </p>
            <ul className="space-y-2.5">
              {(data.questions_for_doctor || []).map((q, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                  <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{q}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* General Wellness & Lifestyle Context */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Apple className="w-4 h-4 text-emerald-600" />
              General Wellness & Context
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Standard non-clinical lifestyle considerations relevant to baseline health:
            </p>
            <ul className="space-y-2.5">
              {(data.dietary_lifestyle_notes || []).map((note, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5"></span>
                  <span className="leading-relaxed">{note}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-[11px] text-slate-400 mt-6 pt-4 border-t border-slate-100">
            *Lifestyle notes are non-prescriptive educational suggestions. Always confirm any dietary or supplement changes with your healthcare team.
          </p>
        </div>
      </div>
    </div>
  )
}
