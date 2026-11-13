import React, { useState, useRef } from 'react'
import { UploadCloud, FileText, Image as ImageIcon, X, Sparkles, Check, ArrowRight } from 'lucide-react'

const SAMPLE_REPORTS = [
  {
    name: 'Complete Blood Count (CBC)',
    badge: 'Mild Low Hemoglobin',
    text: `CENTRAL METROPOLIS LABS
Patient: Rajesh Kumar | Age: 42 | Gender: Male
Referred by: Dr. V. Patel | Date: 12-Nov-2026

COMPLETE BLOOD COUNT (CBC):
- Hemoglobin: 11.2 g/dL (Reference: 13.0 - 17.0 g/dL) [LOW]
- Total WBC Count: 7,200 /mcL (Reference: 4,000 - 11,000 /mcL) [NORMAL]
- Platelet Count: 220,000 /mcL (Reference: 150,000 - 450,000 /mcL) [NORMAL]
- RBC Count: 4.1 million/mcL (Reference: 4.5 - 5.5 million/mcL) [LOW]
- Serum Ferritin: 18 ng/mL (Reference: 30 - 300 ng/mL) [LOW]
- ESR (1st hour): 14 mm/hr (Reference: 0 - 15 mm/hr) [NORMAL]`
  },
  {
    name: 'Metabolic & Lipid Panel',
    badge: 'Borderline Glucose & Lipids',
    text: `HEALTHCARE DIAGNOSTIC PATHOLOGY
Patient: Sunita Sharma | Age: 53 | Gender: Female
Date: 10-Nov-2026

METABOLIC & LIPID PROFILE:
- Fasting Blood Sugar (FBS): 114 mg/dL (Reference: 70 - 99 mg/dL) [HIGH]
- HbA1c (Glycated Hemoglobin): 5.9 % (Reference: < 5.7 %) [BORDERLINE]
- Total Cholesterol: 228 mg/dL (Reference: < 200 mg/dL) [HIGH]
- Triglycerides: 185 mg/dL (Reference: < 150 mg/dL) [HIGH]
- HDL Cholesterol ('Good'): 42 mg/dL (Reference: > 50 mg/dL) [LOW]
- LDL Cholesterol ('Bad'): 149 mg/dL (Reference: < 100 mg/dL) [HIGH]
- Serum Creatinine: 0.85 mg/dL (Reference: 0.6 - 1.1 mg/dL) [NORMAL]`
  },
  {
    name: 'Thyroid & Vitamin Profile',
    badge: 'High TSH & Low Vit D',
    text: `APEX WELLNESS CLINICAL LAB
Patient: Anita Verma | Age: 29 | Gender: Female
Date: 08-Nov-2026

ENDOCRINE & VITAMIN PANEL:
- Thyroid Stimulating Hormone (TSH): 5.85 uIU/mL (Reference: 0.40 - 4.20 uIU/mL) [HIGH]
- Free T3 (FT3): 2.9 pg/mL (Reference: 2.3 - 4.2 pg/mL) [NORMAL]
- Free T4 (FT4): 1.1 ng/dL (Reference: 0.8 - 1.8 ng/dL) [NORMAL]
- Vitamin D3 (25-OH): 16.4 ng/mL (Reference: 30.0 - 100.0 ng/mL) [DEFICIENT]
- Vitamin B12: 340 pg/mL (Reference: 200 - 900 pg/mL) [NORMAL]
- Serum Calcium: 9.3 mg/dL (Reference: 8.6 - 10.2 mg/dL) [NORMAL]`
  }
]

export default function FileUploader({ onStartAnalysis, isProcessing }) {
  const [activeTab, setActiveTab] = useState('upload') // 'upload' | 'text'
  const [selectedFile, setSelectedFile] = useState(null)
  const [pastedText, setPastedText] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef(null)

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
      handleFileSelected(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0])
    }
  }

  const handleFileSelected = (file) => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type) && !file.name.match(/\.(pdf|png|jpe?g|webp)$/i)) {
      alert('Please upload a PDF document or image file (PNG, JPG, WEBP).')
      return
    }
    setSelectedFile(file)
  }

  const handleLoadSample = (sample) => {
    setActiveTab('text')
    setPastedText(sample.text)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (activeTab === 'upload' && selectedFile) {
      onStartAnalysis({ file: selectedFile })
    } else if (activeTab === 'text' && pastedText.trim()) {
      onStartAnalysis({ rawText: pastedText })
    }
  }

  const isSubmitDisabled = isProcessing || (activeTab === 'upload' && !selectedFile) || (activeTab === 'text' && !pastedText.trim())

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Tab Switcher */}
      <div className="flex border-b border-slate-200 bg-slate-50/60 p-1.5 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'upload'
              ? 'bg-white text-teal-700 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <UploadCloud className="w-4 h-4" />
          Upload Report (PDF / Image)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('text')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'text'
              ? 'bg-white text-teal-700 shadow-sm border border-slate-200/60'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <FileText className="w-4 h-4" />
          Paste Report Text / Use Sample
        </button>
      </div>

      <div className="p-6 sm:p-8">
        {activeTab === 'upload' ? (
          <div>
            {/* Dropzone */}
            {!selectedFile ? (
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-teal-500 bg-teal-50/50 scale-[1.01]'
                    : 'border-slate-300 hover:border-teal-400 hover:bg-slate-50/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-16 h-16 rounded-2xl bg-teal-50 text-teal-600 mx-auto flex items-center justify-center mb-4">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-800 mb-1">
                  Click to select or drag & drop your laboratory report
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                  Supports digital PDFs, scanned reports, and smartphone camera photos (PDF, PNG, JPG, WEBP up to 15MB)
                </p>
                <div className="inline-flex items-center gap-2 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-detects native text or falls back to OCR
                </div>
              </div>
            ) : (
              /* Selected File Preview Card */
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                    {selectedFile.name.endsWith('.pdf') ? <FileText className="w-6 h-6" /> : <ImageIcon className="w-6 h-6" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800 line-clamp-1">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Ready for AI extraction
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Text Input Mode */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Paste Lab Report Text
              </label>
              <textarea
                rows={7}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste the text from your diagnostic lab report here (e.g. Hemoglobin: 11.2 g/dL, Fasting Glucose: 115 mg/dL)..."
                className="w-full text-xs sm:text-sm font-mono p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all placeholder:text-slate-400 text-slate-800"
              />
            </div>

            {/* Quick 1-Click Sample Reports */}
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Or try one of these standard sample reports:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {SAMPLE_REPORTS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleLoadSample(s)}
                    className="text-left p-3 rounded-xl border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 transition-all group"
                  >
                    <p className="text-xs font-bold text-slate-800 group-hover:text-teal-700">{s.name}</p>
                    <span className="inline-block mt-1 text-[10px] font-medium text-teal-700 bg-teal-100/60 px-1.5 py-0.5 rounded">
                      {s.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            Your health data is processed privately in-memory and never sold.
          </p>
          <button
            type="button"
            disabled={isSubmitDisabled}
            onClick={handleSubmit}
            className={`w-full sm:w-auto px-7 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 shadow-md transition-all ${
              isSubmitDisabled
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-teal-600/25 hover:shadow-lg hover:shadow-teal-600/30'
            }`}
          >
            {isProcessing ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Explaining Report...
              </>
            ) : (
              <>
                Explain My Report
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
