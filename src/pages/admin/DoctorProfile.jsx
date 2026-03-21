import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import { InlineSpinner } from '../../components/LoadingSpinner'
import { Stethoscope, Save, CheckCircle, User } from 'lucide-react'

const SPECIALIZATIONS = ['General Medicine', 'Emergency Medicine', 'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology', 'Oncology', 'Dermatology', 'Psychiatry', 'Radiology', 'Anesthesiology', 'Other']
const DEPARTMENTS = ['Emergency', 'ICU', 'OPD', 'Surgery', 'Cardiology', 'Neurology', 'Pediatrics', 'Oncology', 'Radiology', 'General Ward', 'Other']

export default function DoctorProfile() {
  const { profile } = useAuth()
  const [form, setForm] = useState({ specialization: '', department: '', license_number: '', experience_years: '', bio: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('doctor_profiles').select('*').eq('id', profile.id).single()
      if (data) setForm({ specialization: data.specialization || '', department: data.department || '', license_number: data.license_number || '', experience_years: data.experience_years || '', bio: data.bio || '' })
      setLoading(false)
    }
    if (profile) load()
  }, [profile])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true); setError('')
    const { error: err } = await supabase.from('doctor_profiles').upsert({ id: profile.id, ...form, experience_years: parseInt(form.experience_years) || null }, { onConflict: 'id' })
    if (err) setError(err.message)
    else { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    setSaving(false)
  }

  if (loading) return <div className="min-h-screen"><Navbar /><div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-2 border-slate-700 border-t-violet-500 rounded-full animate-spin" /></div></div>

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8 animate-slide-up">
          <h1 className="section-title flex items-center gap-3"><Stethoscope className="w-6 h-6 text-violet-400" />Doctor Profile</h1>
          <p className="text-slate-400 text-sm mt-1">Your professional information shown to patients and staff</p>
        </div>

        {/* Profile card preview */}
        <div className="card p-5 mb-6 border-violet-500/20 bg-violet-500/5 flex items-center gap-4 animate-fade-in">
          <div className="w-14 h-14 bg-violet-500/20 border border-violet-500/30 rounded-2xl flex items-center justify-center flex-shrink-0">
            <User className="w-7 h-7 text-violet-400" />
          </div>
          <div>
            <p className="font-display font-bold text-white text-lg">{profile?.full_name}</p>
            <p className="text-violet-300 text-sm">{form.specialization || 'Specialization not set'} {form.department && `· ${form.department}`}</p>
            {form.experience_years && <p className="text-slate-500 text-xs mt-0.5">{form.experience_years} years experience</p>}
          </div>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>}

        <form onSubmit={handleSave} className="space-y-6 animate-stagger">
          <div className="card p-6 space-y-4">
            <h2 className="font-display font-semibold text-white text-base">Professional Details</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Specialization</label>
                <select className="input" value={form.specialization} onChange={e => setForm(f => ({...f, specialization: e.target.value}))}>
                  <option value="">Select specialization</option>
                  {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Department</label>
                <select className="input" value={form.department} onChange={e => setForm(f => ({...f, department: e.target.value}))}>
                  <option value="">Select department</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">License Number</label>
                <input className="input" type="text" placeholder="MCI-XXXXX" value={form.license_number} onChange={e => setForm(f => ({...f, license_number: e.target.value}))} />
              </div>
              <div>
                <label className="label">Years of Experience</label>
                <input className="input" type="number" min="0" max="60" placeholder="e.g. 10" value={form.experience_years} onChange={e => setForm(f => ({...f, experience_years: e.target.value}))} />
              </div>
            </div>
            <div>
              <label className="label">Professional Bio</label>
              <textarea className="input resize-none" rows={4} placeholder="Brief description of your background, expertise, and approach to patient care…" value={form.bio} onChange={e => setForm(f => ({...f, bio: e.target.value}))} />
            </div>
          </div>

          <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-violet-500 hover:bg-violet-400 text-white transition-all disabled:opacity-50" disabled={saving}>
            {saving ? <><InlineSpinner />Saving…</> : saved ? <><CheckCircle className="w-4 h-4" />Saved!</> : <><Save className="w-4 h-4" />Save Profile</>}
          </button>
        </form>
      </main>
    </div>
  )
}
