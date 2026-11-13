import React from 'react'
import { 
  FileText, 
  Sparkles, 
  HeartHandshake, 
  HelpCircle, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  Stethoscope, 
  Eye, 
  Lock,
  Layers,
  ArrowUpRight
} from 'lucide-react'
import DisclaimerBanner from './DisclaimerBanner'

export default function LandingPage({ onGoToDashboard, onOpenUpload, onSelectReport, sampleReports }) {
  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto px-4 pt-6 sm:pt-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold mb-6 shadow-xs animate-in fade-in">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Patient-Centered Health Literacy Companion</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15] mb-5">
          Understand Your Medical Reports Without{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-teal-600 to-emerald-600">
            Fear or Confusion
          </span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto mb-8 font-normal">
          Laboratory reports are packed with dense acronyms and alarming flags. 
          <strong className="text-slate-800 font-semibold"> ReportSaathi</strong> translates complex diagnostic numbers into calm, compassionate, plain-language insights to empower your next doctor consultation.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button
            onClick={onOpenUpload}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-lg shadow-teal-600/25 hover:shadow-xl hover:shadow-teal-600/30 transition-all flex items-center justify-center gap-2 group"
          >
            <span>Upload Demo Report</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={onGoToDashboard}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex items-center justify-center gap-2"
          >
            <span>Explore Dashboard & Samples</span>
          </button>
        </div>

        <p className="text-[11px] text-slate-400 mt-4">
          Demo version &bull; No registration needed &bull; Private in-memory processing
        </p>
      </section>

      {/* Mandatory Medical Disclaimer Banner */}
      <section className="max-w-4xl mx-auto px-4">
        <DisclaimerBanner />
      </section>

      {/* How It Works 3-Step Walkthrough */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
            How ReportSaathi Works
          </h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">
            From complicated paperwork to clear understanding in three simple, patient-first steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-extrabold text-lg mb-4 border border-teal-100">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Upload or Snap</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Upload your lab report as a digital PDF or take a phone camera picture (JPG, PNG). The system automatically detects file parameters and text layouts.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-lg mb-4 border border-emerald-100">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Contextual Translation</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Our explanation engine cross-references standard reference intervals to explain what each biomarker measures—without technical jargon or panic.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs relative">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-extrabold text-lg mb-4 border border-blue-100">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">Empowering Doctor Prep</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Receive a curated list of tailored questions you can ask your doctor at your consultation, helping you actively participate in your healthcare.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Demo Reports Grid */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Explore Realistic Sample Lab Reports
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Click any report below to see full plain-language explanations, biomarker scales, and doctor questions.
            </p>
          </div>
          <button
            onClick={onGoToDashboard}
            className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span>View All in Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {sampleReports.map((report) => (
            <div
              key={report.id}
              onClick={() => onSelectReport(report)}
              className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-teal-400 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                    {report.category}
                  </span>
                  <span className="text-xs text-slate-400">{report.date}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-700 transition-colors mb-1.5">
                  {report.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                  {report.overallSummary}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-semibold text-teal-700 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                  Read Full Explanation
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
                <span className="text-[11px] text-slate-400">
                  {report.biomarkers.length} tests
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Philosophies / Trust Badges */}
      <section className="bg-white border-y border-slate-200 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 mx-auto flex items-center justify-center">
              <Stethoscope className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Non-Diagnostic Safety</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Strictly educational. We never guess illnesses or prescribe medications.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Zero-Panic Language</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Clear, objective insights so you understand what slight variations actually mean.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 mx-auto flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Privacy by Design</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your health data is processed privately and never sold or used for ad targeting.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 mx-auto flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Hybrid Extraction</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Handles native digital PDF documents as well as camera photos and scans.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="max-w-4xl mx-auto px-4 pb-8">
        <div className="bg-gradient-to-tr from-slate-900 to-teal-950 text-white rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Ready to see what a friendly lab report looks like?
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed font-normal">
              Try our interactive sample reports or test the upload simulation to experience plain-language healthcare education.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onOpenUpload}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-teal-500 hover:bg-teal-400 text-slate-950 transition-colors shadow-md"
              >
                Upload Report File
              </button>
              <button
                onClick={onGoToDashboard}
                className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs sm:text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
