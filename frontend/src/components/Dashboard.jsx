import React, { useState } from 'react'
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Calendar, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  Eye, 
  Sparkles, 
  FolderOpen,
  RefreshCw
} from 'lucide-react'
import DisclaimerBanner from './DisclaimerBanner'

export default function Dashboard({ 
  reports, 
  onSelectReport, 
  onOpenUpload,
  isEmptyState,
  setIsEmptyState 
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const displayedReports = isEmptyState 
    ? [] 
    : reports.filter(r => {
        const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.category.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'all' || r.category.toLowerCase() === selectedCategory.toLowerCase()
        return matchesSearch && matchesCategory
      })

  const categories = ['all', 'Hematology', 'Biochemistry', 'Endocrinology']

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'prompt_attention':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" /> Prompt Review
          </span>
        )
      case 'follow_up_recommended':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <AlertCircle className="w-3 h-3 text-amber-600" /> Follow-Up Recommended
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Routine
          </span>
        )
    }
  }

  return (
    <div className="space-y-8 py-4">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Reports Dashboard
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
              Demo Workspace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            View recent laboratory translations, compare metrics, and manage your health files.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Toggle for Reviewer to test Empty State */}
          <button
            onClick={() => setIsEmptyState(!isEmptyState)}
            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors flex items-center gap-1.5"
            title="Toggle between populated list and empty state"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            {isEmptyState ? 'Load Demo Reports' : 'Simulate Empty State'}
          </button>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Upload Report</span>
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer */}
      <DisclaimerBanner compact />

      {/* Quick Summary Metrics */}
      {!isEmptyState && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Analyzed Reports</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{reports.length}</span>
              <span className="text-xs text-teal-700 font-medium">Demo Files</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Clinical Safety Level</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-700">100%</span>
              <span className="text-xs text-slate-500 font-medium">Educational Context</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 block mb-1">Doctor Questions Generated</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-teal-800">9</span>
              <span className="text-xs text-slate-500 font-medium">Actionable Prompts</span>
            </div>
          </div>
        </div>
      )}

      {/* Reports Section with Filter/Search */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by test name, patient, category..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold capitalize whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area: Empty State vs Reports List */}
        {isEmptyState ? (
          /* EMPTY STATE */
          <div className="p-12 sm:p-16 text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center mb-4 border border-teal-100">
              <FolderOpen className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1.5">No Reports Found</h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
              Your dashboard currently has no lab reports. Upload your first PDF, JPG, or PNG document to see plain-language biomarker explanations.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onOpenUpload}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-teal-600 hover:bg-teal-700 shadow-sm transition-all"
              >
                Upload First Report
              </button>
              <button
                onClick={() => setIsEmptyState(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
              >
                Load Demo Reports
              </button>
            </div>
          </div>
        ) : displayedReports.length === 0 ? (
          /* NO SEARCH MATCHES */
          <div className="p-12 text-center text-slate-500 text-xs sm:text-sm">
            <p className="font-semibold text-slate-700">No reports matched your search criteria.</p>
            <p className="text-xs text-slate-400 mt-1">Try resetting the category filter or clearing the search query.</p>
          </div>
        ) : (
          /* POPULATED REPORT LIST */
          <div className="divide-y divide-slate-100">
            {displayedReports.map((report) => (
              <div
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="p-5 sm:p-6 hover:bg-slate-50/80 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-teal-700 bg-teal-50 border border-teal-200/60 px-2 py-0.5 rounded-md">
                      {report.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                      {report.title}
                    </h3>
                    {getUrgencyBadge(report.urgencyLevel)}
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      {report.patient.name} ({report.patient.age}y &bull; {report.patient.gender})
                    </span>
                    <span>&bull;</span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {report.date}
                    </span>
                    <span>&bull;</span>
                    <span>{report.labName}</span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-1 max-w-2xl pt-1">
                    {report.overallSummary}
                  </p>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className="text-xs font-bold text-teal-700 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    View Explanation
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
