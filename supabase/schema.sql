-- ============================================================
-- MediIntake — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. PROFILES TABLE
--    Extends Supabase auth.users with app-specific data
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  age           INTEGER,
  gender        TEXT,
  phone         TEXT,
  role          TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'admin')),
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create a profile row when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. MEDICAL PROFILES TABLE
--    One row per patient — upserted, not duplicated
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.medical_profiles (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id                  UUID NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  blood_group                 TEXT,
  allergies                   TEXT,
  chronic_conditions          TEXT[]  DEFAULT '{}',
  current_medications         TEXT,
  emergency_contact_name      TEXT,
  emergency_contact_phone     TEXT,
  emergency_contact_relation  TEXT,
  past_medical_history        TEXT,
  updated_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_updated_at ON public.medical_profiles;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.medical_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- 3. INTAKES TABLE
--    Each emergency intake submission
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.intakes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  symptoms        TEXT[]  DEFAULT '{}',
  severity        TEXT    NOT NULL DEFAULT 'mild' CHECK (severity IN ('mild', 'moderate', 'severe')),
  duration_hours  NUMERIC,
  temperature     NUMERIC,
  heart_rate      NUMERIC,
  bp_systolic     NUMERIC,
  bp_diastolic    NUMERIC,
  notes           TEXT,
  risk_score      INTEGER NOT NULL DEFAULT 0,
  risk_level      TEXT    NOT NULL DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high')),
  risk_breakdown  JSONB   DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast dashboard queries
CREATE INDEX IF NOT EXISTS intakes_risk_level_idx ON public.intakes(risk_level);
CREATE INDEX IF NOT EXISTS intakes_patient_id_idx ON public.intakes(patient_id);
CREATE INDEX IF NOT EXISTS intakes_created_at_idx ON public.intakes(created_at DESC);


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intakes        ENABLE ROW LEVEL SECURITY;


-- PROFILES policies
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );


-- MEDICAL PROFILES policies
CREATE POLICY "Patients can manage their own medical profile"
  ON public.medical_profiles FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Admins can view all medical profiles"
  ON public.medical_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );


-- INTAKES policies
CREATE POLICY "Patients can manage their own intakes"
  ON public.intakes FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Admins can view all intakes"
  ON public.intakes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );


-- ============================================================
-- Enable real-time on intakes (for live admin dashboard)
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.intakes;
