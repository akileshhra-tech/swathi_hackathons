import React, { useState } from 'react'
import { Activity, Plus, Menu, X, Sparkles, LayoutDashboard, Home, CheckCircle2, AlertTriangle } from 'lucide-react'

export default function Navbar({ currentView, setCurrentView, onOpenUpload, backendStatus }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { id: 'landing', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ]

  const handleNavClick = (viewId) => {
    setCurrentView(viewId)
    setMobileMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div 
          onClick={() => handleNavClick('landing')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                ReportSaathi
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-teal-600" />
                OCR Enabled
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">Plain-Language Medical Report Companion</p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 border border-teal-200/60 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            )
          })}
        </nav>

        {/* Backend Status indicator & Action Button */}
        <div className="flex items-center gap-3">
          {/* Live FastAPI Backend Status Pill */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl">
            {backendStatus.online ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-slate-700 font-semibold">FastAPI & OCR Ready</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-slate-500">Checking API...</span>
              </>
            )}
          </div>

          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-md shadow-teal-600/20 hover:shadow-teal-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Upload Report</span>
          </button>

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 animate-in fade-in slide-in-from-top-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 border border-teal-200'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            )
          })}
          <div className="pt-2">
            <div className="text-[11px] text-slate-500 px-3 py-1.5 bg-slate-50 rounded-lg flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${backendStatus.online ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
              <span>FastAPI Backend: {backendStatus.online ? 'Connected' : 'Connecting...'}</span>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
