-- ============================================================
-- MediIntake v2 Migration
-- Run in: Supabase → SQL Editor → New Query
-- ============================================================

-- 1. Add status + doctor_notes to intakes
ALTER TABLE public.intakes
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewed')),
  ADD COLUMN IF NOT EXISTS doctor_notes TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.profiles(id);

-- 2. Appointments table
CREATE TABLE IF NOT EXISTS public.appointments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reason        TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT,
  notes         TEXT,
  status        TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  admin_note    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS appointments_patient_id_idx ON public.appointments(patient_id);
CREATE INDEX IF NOT EXISTS appointments_status_idx ON public.appointments(status);

-- 3. RLS for appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients manage own appointments"
  ON public.appointments FOR ALL
  USING (auth.uid() = patient_id)
  WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Admins view all appointments"
  ON public.appointments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

CREATE POLICY "Admins update appointments"
  ON public.appointments FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- 4. Allow admins to update intakes (for doctor notes + reviewed status)
CREATE POLICY "Admins update intakes"
  ON public.intakes FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- 5. Real-time for appointments
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
