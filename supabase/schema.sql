-- ==============================================================================
-- ReportSaathi - Supabase Database Schema
-- Privacy-First Medical Report Companion with Row Level Security (RLS)
-- ==============================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table
-- Holds basic user metadata linked to Supabase Auth
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Saved Reports History Table
-- PRIVACY PRINCIPLE: We strictly store structured educational summaries and
-- biomarker parameters. We DO NOT store raw uploaded PDF/Image files or
-- unparsed clinical text by default.
CREATE TABLE IF NOT EXISTS public.saved_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    report_date TEXT,
    category TEXT DEFAULT 'General Lab',
    urgency_level TEXT DEFAULT 'routine',
    overall_summary TEXT NOT NULL,
    biomarkers JSONB DEFAULT '[]'::jsonb NOT NULL,
    doctor_questions JSONB DEFAULT '[]'::jsonb NOT NULL,
    wellness_notes JSONB DEFAULT '[]'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_saved_reports_user_id ON public.saved_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_reports_created_at ON public.saved_reports(created_at DESC);

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures each user can ONLY access and modify their own records.
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Saved Reports Policies
CREATE POLICY "Users can view only their own saved reports"
    ON public.saved_reports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports"
    ON public.saved_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
    ON public.saved_reports FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete only their own reports"
    ON public.saved_reports FOR DELETE
    USING (auth.uid() = user_id);

-- ==============================================================================
-- 5. AUTOMATIC PROFILE CREATION TRIGGER
-- When a user signs up via Supabase Auth, automatically insert a row in profiles
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
