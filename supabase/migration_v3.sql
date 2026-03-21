-- ============================================================
-- MediIntake v3 Migration
-- Run in: Supabase → SQL Editor → New Query
-- ============================================================

-- 1. Medication reminders
CREATE TABLE IF NOT EXISTS public.medication_reminders (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  medication  TEXT NOT NULL,
  dosage      TEXT,
  frequency   TEXT,
  time_of_day TEXT,
  notes       TEXT,
  active      BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.medication_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Patients manage own reminders"
  ON public.medication_reminders FOR ALL
  USING (auth.uid() = patient_id) WITH CHECK (auth.uid() = patient_id);

-- 2. Doctor profiles
CREATE TABLE IF NOT EXISTS public.doctor_profiles (
  id              UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  specialization  TEXT,
  department      TEXT,
  license_number  TEXT,
  experience_years INTEGER,
  bio             TEXT,
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.doctor_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins manage own doctor profile"
  ON public.doctor_profiles FOR ALL
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Patients can view doctor profiles"
  ON public.doctor_profiles FOR SELECT USING (true);

-- 3. Messages (admin → patient)
CREATE TABLE IF NOT EXISTS public.messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  to_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  subject     TEXT NOT NULL,
  body        TEXT NOT NULL,
  read        BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see their own messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = to_id OR auth.uid() = from_id);
CREATE POLICY "Admins can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );
CREATE POLICY "Recipients can mark read"
  ON public.messages FOR UPDATE
  USING (auth.uid() = to_id);

-- 4. Add discharged + flagged to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_discharged BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_flagged     BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS discharged_at  TIMESTAMPTZ;

-- 5. Real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.medication_reminders;
