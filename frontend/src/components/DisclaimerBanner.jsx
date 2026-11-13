import React from 'react'
import { ShieldAlert, AlertTriangle } from 'lucide-react'

export default function DisclaimerBanner({ compact = false }) {
  if (compact) {
    return (
      <div 
        role="alert" 
        className="bg-amber-50 border border-amber-300/80 text-amber-900 text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2.5 shadow-sm"
      >
        <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" aria-hidden="true" />
        <p className="leading-snug">
          <strong className="font-semibold text-amber-950">Educational Purpose Only:</strong> ReportSaathi is not a diagnostic tool or substitute for professional medical counsel. Always consult a certified physician.
        </p>
      </div>
    )
  }

  return (
    <aside 
      aria-label="Medical Disclaimer" 
      className="bg-amber-50/90 border-l-4 border-amber-500 p-4 sm:p-5 rounded-r-2xl text-amber-950 shadow-sm border-y border-r border-amber-200/60 my-6"
    >
      <div className="flex items-start gap-3.5">
        <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <ShieldAlert className="h-5 w-5 text-amber-700" aria-hidden="true" />
        </div>
        <div className="space-y-1.5 text-xs sm:text-sm">
          <h3 className="font-bold text-amber-950 text-sm sm:text-base tracking-tight">
            Important Medical & Educational Disclaimer
          </h3>
          <p className="text-amber-900 leading-relaxed">
            ReportSaathi is an educational health literacy companion. It is strictly engineered to translate confusing laboratory terminology, reference intervals, and medical units into accessible, everyday language.
          </p>
          <p className="text-amber-800 text-[11px] sm:text-xs leading-relaxed font-medium">
            &bull; It does <strong>not</strong> make clinical diagnoses, formulate treatment plans, or replace individualized care.<br />
            &bull; Laboratory test results must always be interpreted in conjunction with clinical symptoms and your personal medical history by a licensed healthcare provider.<br />
            &bull; In the event of a medical emergency or critical acute symptoms, seek immediate emergency medical care.
          </p>
        </div>
      </div>
    </aside>
  )
}
