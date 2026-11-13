import React, { useState, useEffect } from 'react'
import { FileSearch, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react'

export default function ProcessingStatus() {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    { title: 'Reading Document', desc: 'Analyzing layout and document structure...' },
    { title: 'Extracting Biomarkers', desc: 'Running PyMuPDF parser and Tesseract OCR engine...' },
    { title: 'Translating to Plain Language', desc: 'Consulting Gemini medical knowledge & reference intervals...' },
    { title: 'Synthesizing Educational Summary', desc: 'Formulating compassionate explanations and doctor questions...' }
  ]

  useEffect(() => {
    const timer1 = setTimeout(() => setCurrentStep(1), 1200)
    const timer2 = setTimeout(() => setCurrentStep(2), 2600)
    const timer3 = setTimeout(() => setCurrentStep(3), 4200)
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  return (
    <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-sm border border-slate-200 text-center max-w-xl mx-auto my-8">
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 rounded-full bg-teal-100 animate-ping opacity-30"></div>
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/30">
          <Sparkles className="w-9 h-9 animate-spin text-white" style={{ animationDuration: '4s' }} />
        </div>
      </div>

      <h3 className="text-xl font-bold text-slate-800 mb-2">Analyzing Your Lab Report</h3>
      <p className="text-xs text-slate-500 mb-8 max-w-sm mx-auto">
        ReportSaathi is parsing biomarkers, cross-referencing healthy ranges, and translating findings into accessible language.
      </p>

      {/* Step Indicators */}
      <div className="space-y-3.5 text-left max-w-md mx-auto">
        {steps.map((s, index) => {
          const isDone = currentStep > index
          const isCurrent = currentStep === index
          return (
            <div 
              key={index} 
              className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                isCurrent 
                  ? 'border-teal-300 bg-teal-50/70 shadow-sm' 
                  : isDone 
                  ? 'border-emerald-200 bg-emerald-50/40 opacity-90' 
                  : 'border-slate-100 bg-slate-50/50 opacity-40'
              }`}
            >
              <div className="mt-0.5">
                {isDone ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : isCurrent ? (
                  <div className="w-5 h-5 rounded-full border-2 border-teal-600 border-t-transparent animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                )}
              </div>
              <div>
                <p className={`text-xs font-bold ${isCurrent ? 'text-teal-900' : isDone ? 'text-emerald-900' : 'text-slate-600'}`}>
                  {s.title}
                </p>
                <p className="text-[11px] text-slate-500">{s.desc}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
