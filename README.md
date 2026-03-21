# MediIntake — Digital Healthcare Intake System

A full-stack web application for structured patient intake and rule-based emergency risk scoring.

**Stack:** React + Vite · Node/Express via Supabase Edge · Supabase (Auth + DB) · Tailwind CSS · Deployed on Vercel

---

## Features

- **Patient side** — Registration, one-time medical profile, emergency intake form, intake history
- **Admin/Hospital side** — Live dashboard, risk-sorted patient list, detailed patient records, emergency quick-view
- **Risk scoring engine** — Transparent, rule-based scoring (no ML) across symptoms, vitals, age, and chronic conditions
- **Real-time updates** — Admin dashboard auto-refreshes when new intakes arrive

---

## Setup Guide

### Step 1 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up / log in
2. Click **New Project**
3. Fill in: Project name (e.g. `mediintake`), database password (save it!), region closest to you
4. Wait ~2 minutes for the project to spin up

### Step 2 — Run the Database Schema

1. In your Supabase project, go to **SQL Editor** (left sidebar)
2. Click **New Query**
3. Open the file `supabase/schema.sql` from this project
4. Paste the entire contents into the editor
5. Click **Run** (or Ctrl+Enter)
6. You should see "Success. No rows returned." — this is correct.

### Step 3 — Get Your Supabase Credentials

1. In your Supabase project, go to **Settings → API**
2. Copy:
   - **Project URL** (looks like `https://abcxyz.supabase.co`)
   - **anon public** key (long JWT string under "Project API keys")

### Step 4 — Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```
   cp .env.example .env.local
   ```
2. Open `.env.local` and fill in:
   ```env
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   VITE_ADMIN_CODE=YOUR_SECRET_ADMIN_CODE
   ```
   > `VITE_ADMIN_CODE` is the secret code hospital staff need to register as an admin. Choose any string.

### Step 5 — Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deploying to Vercel

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/mediintake.git
git push -u origin main
```

### Step 2 — Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **Add New → Project**
3. Import your GitHub repository
4. Vercel auto-detects Vite — no framework changes needed

### Step 3 — Add Environment Variables in Vercel

Before deploying, go to **Environment Variables** in the Vercel project settings and add:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_ADMIN_CODE` | Your chosen admin registration code |

### Step 4 — Deploy

Click **Deploy**. Vercel will build and deploy. Your app is live!

---

## Application Walkthrough

### As a Patient

1. Go to `/register` → Select **Patient** tab → Fill in details → Register
2. You'll land on your dashboard with a prompt to complete your **Medical Profile**
3. Fill in blood group, allergies, chronic conditions, current medications, emergency contact
4. When unwell, click **New Intake** → Select symptoms, severity, vitals → Submit
5. The system automatically calculates your risk score and sends it to the hospital dashboard
6. View all past submissions under **My Records**

### As Hospital Staff

1. Go to `/register` → Select **Hospital Staff** tab → Enter admin code → Register
2. The Admin Dashboard shows all patient intakes sorted by risk score (highest first)
3. Use the risk filter buttons to show only HIGH / MEDIUM / LOW risk patients
4. Search by patient name or email
5. Click the 🚨 icon for **Emergency View** — shows only critical info (blood group, allergies, medications, emergency contact)
6. Click → for the full **Patient Detail** page with complete intake history

---

## Risk Scoring Logic

Each factor contributes points to a 0–100 score:

| Category | Factor | Points |
|----------|--------|--------|
| Symptoms | Chest pain | 30 |
| Symptoms | Loss of consciousness | 40 |
| Symptoms | Seizure | 38 |
| Symptoms | Breathlessness | 25 |
| Symptoms | Confusion | 22 |
| Severity | Moderate multiplier | ×1.5 |
| Severity | Severe multiplier | ×2.0 |
| Vitals | Heart rate >150 bpm | 30 |
| Vitals | Systolic BP <90 mmHg | 30 |
| Vitals | Temperature ≥40°C | 20 |
| Age | 60–69 years | 10 |
| Age | 70–79 years | 15 |
| Age | 80+ years | 20 |
| Conditions | Heart disease | 20 |
| Conditions | Stroke history | 18 |

**Final Classification:**
- 🟢 **LOW** — 0 to 30 points
- 🟡 **MEDIUM** — 31 to 60 points
- 🔴 **HIGH** — 61+ points

The full breakdown is stored with every intake and shown to both patients and doctors.

---

## Project Structure

```
src/
├── components/        # Navbar, RiskBadge, ProtectedRoute, LoadingSpinner
├── context/           # AuthContext (Supabase session + profile)
├── lib/
│   ├── supabaseClient.js   # Supabase client initialisation
│   └── riskScoring.js      # Rule-based scoring engine
├── pages/
│   ├── Landing.jsx
│   ├── auth/          # Login, Register
│   ├── patient/       # Dashboard, MedicalProfile, NewIntake, IntakeHistory
│   └── admin/         # AdminDashboard, PatientDetail, EmergencyView
supabase/
└── schema.sql         # Full DB schema + RLS policies
```

---

## Notes

- This system is a demonstration / academic project. Do not use in real clinical settings without proper medical and legal review.
- The admin code (`VITE_ADMIN_CODE`) is client-side and suitable for a demo. For production, move registration approval to a server-side flow.
- Supabase Row Level Security ensures patients can only access their own data.
