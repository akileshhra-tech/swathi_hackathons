import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Check if credentials are valid and not default placeholder strings
export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key')
)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null

// ==========================================
// AUTHENTICATION HELPERS
// ==========================================

export const signUpUser = async ({ email, password, fullName }) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })
  if (error) throw error
  return data
}

export const signInUser = async ({ email, password }) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export const signOutUser = async () => {
  if (!isSupabaseConfigured || !supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const getCurrentUser = async () => {
  if (!isSupabaseConfigured || !supabase) return null
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ==========================================
// REPORT HISTORY (CRUD with Row Level Security)
// ==========================================

/**
 * Saves report to cloud history.
 * PRIVACY: We only persist structured parameters and summaries.
 * We DO NOT store raw uploaded PDF/Image files or unparsed clinical documents.
 */
export const saveReportToCloud = async (report) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Cloud storage unavailable: Supabase credentials are not configured. The report was not saved.')
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Authentication required: You must be signed in to save reports to your private history.')
  }

  const payload = {
    user_id: user.id,
    title: report.title || 'Laboratory Report',
    report_date: report.date || new Date().toISOString().split('T')[0],
    category: report.category || 'General Lab',
    urgency_level: report.urgencyLevel || 'routine',
    overall_summary: report.overallSummary || '',
    biomarkers: report.biomarkers || [],
    doctor_questions: report.doctorQuestions || [],
    wellness_notes: report.wellnessNotes || [],
  }

  const { data, error } = await supabase
    .from('saved_reports')
    .insert([payload])
    .select()
    .single()

  if (error) throw error
  return data
}

export const fetchSavedReportsFromCloud = async () => {
  if (!isSupabaseConfigured || !supabase) {
    return []
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('saved_reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching reports from Supabase:', error)
    throw error
  }

  // Map database columns to UI format
  return (data || []).map((row) => ({
    id: row.id,
    dbId: row.id,
    title: row.title,
    date: row.report_date,
    category: row.category,
    urgencyLevel: row.urgency_level,
    overallSummary: row.overall_summary,
    biomarkers: row.biomarkers,
    doctorQuestions: row.doctor_questions,
    wellnessNotes: row.wellness_notes,
    isCloudSaved: true,
    patient: {
      name: user.user_metadata?.full_name || 'Account Holder',
      id: user.id.slice(0, 8),
      gender: 'Private Record',
      age: 'N/A'
    }
  }))
}

export const deleteReportFromCloud = async (reportId) => {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase not configured.')
  }

  const { error } = await supabase
    .from('saved_reports')
    .delete()
    .eq('id', reportId)

  if (error) throw error
  return true
}
