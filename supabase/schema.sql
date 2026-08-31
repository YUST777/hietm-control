-- ==============================================================================
-- HIET Control & Examination Proctoring System - PostgreSQL Schema for Supabase
-- ==============================================================================

-- 1. Observers / Invigilators Table
CREATE TABLE IF NOT EXISTS public.observers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    job TEXT NOT NULL,
    specialization TEXT NOT NULL,
    days TEXT NOT NULL DEFAULT '',
    hours NUMERIC NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Curriculum Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    dept TEXT NOT NULL,
    year TEXT NOT NULL,
    semester TEXT NOT NULL,
    spec TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Examination Committees / Halls Table
CREATE TABLE IF NOT EXISTS public.committees (
    id TEXT PRIMARY KEY,
    room_num TEXT NOT NULL,
    hall_name TEXT NOT NULL,
    floor TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 30,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Examination Schedule Slots Table
CREATE TABLE IF NOT EXISTS public.schedule_slots (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    period TEXT NOT NULL,
    start_time TEXT NOT NULL,
    semester TEXT NOT NULL,
    academic_year TEXT NOT NULL,
    exam_type TEXT NOT NULL DEFAULT 'تحريري',
    reserves JSONB NOT NULL DEFAULT '[]'::jsonb,
    rows JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. 14-Stage Control Checklist Table
CREATE TABLE IF NOT EXISTS public.control_works (
    subject_id TEXT PRIMARY KEY,
    subject_name TEXT NOT NULL,
    dept TEXT NOT NULL,
    year TEXT NOT NULL,
    checklist JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. System Settings & Official Signatures Table
CREATE TABLE IF NOT EXISTS public.system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- Row Level Security (RLS) - Permissive Policies for Educational Staff
-- ==============================================================================

ALTER TABLE public.observers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.control_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on observers" ON public.observers FOR SELECT USING (true);
CREATE POLICY "Allow public write access on observers" ON public.observers FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on subjects" ON public.subjects FOR SELECT USING (true);
CREATE POLICY "Allow public write access on subjects" ON public.subjects FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on committees" ON public.committees FOR SELECT USING (true);
CREATE POLICY "Allow public write access on committees" ON public.committees FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on schedule_slots" ON public.schedule_slots FOR SELECT USING (true);
CREATE POLICY "Allow public write access on schedule_slots" ON public.schedule_slots FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on control_works" ON public.control_works FOR SELECT USING (true);
CREATE POLICY "Allow public write access on control_works" ON public.control_works FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read access on system_settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Allow public write access on system_settings" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- Realtime Subscriptions Configuration
-- ==============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'observers'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.observers;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'subjects'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.subjects;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'committees'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.committees;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'schedule_slots'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.schedule_slots;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'control_works'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.control_works;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'system_settings'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.system_settings;
    END IF;
END $$;
