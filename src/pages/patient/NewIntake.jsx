import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import RiskBadge from '../../components/RiskBadge'
import { SYMPTOM_OPTIONS, calculateRiskScore } from '../../lib/riskScoring'
import { InlineSpinner } from '../../components/LoadingSpinner'
import { CheckCircle, AlertTriangle, Info } from 'lucide-react'

export default function NewIntake() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    symptoms: [],
    severity: 'mild',
    duration_hours: '',
    temperature: '',
    heart_rate: '',
    bp_systolic: '',
    bp_diastolic: '',
    notes: '',
  })
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const toggleSymptom = (val) => {
    setForm(f => ({
      ...f,
      symptoms: f.symptoms.includes(val)
        ? f.symptoms.filter(s => s !== val)
        : [...f.symptoms, val],
    }))
    setPreview(null)
  }

  const handlePreview = async () => {
    // Fetch chronic conditions from medical profile
    const { data: med } = await supabase
      .from('medical_profiles')
      .select('chronic_conditions')
      .eq('patient_id', profile.id)
      .single()

    const result = calculateRiskScore({
      symptoms: form.symptoms,
      severity: form.severity,
      heartRate: parseFloat(form.heart_rate) || null,
      temperature: parseFloat(form.temperature) || null,
      bpSystolic: parseFloat(form.bp_systolic) || null,
      age: profile.age,
      chronicConditions: med?.chronic_conditions || [],
    })
    setPreview(result)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.symptoms.length === 0) { setError('Please select at least one symptom.'); return }
    setSaving(true)
    setError('')

    const { data: med } = await supabase
      .from('medical_profiles')
      .select('chronic_conditions')
      .eq('patient_id', profile.id)
      .single()

    const result = calculateRiskScore({
      symptoms: form.symptoms,
      severity: form.severity,
      heartRate: parseFloat(form.heart_rate) || null,
      temperature: parseFloat(form.temperature) || null,
      bpSystolic: parseFloat(form.bp_systolic) || null,
      age: profile.age,
      chronicConditions: med?.chronic_conditions || [],
    })

    const { error: err } = await supabase.from('intakes').insert({
      patient_id: profile.id,
      symptoms: form.symptoms,
      severity: form.severity,
      duration_hours: parseFloat(form.duration_hours) || null,
      temperature: parseFloat(form.temperature) || null,
      heart_rate: parseFloat(form.heart_rate) || null,
      bp_systolic: parseFloat(form.bp_systolic) || null,
      bp_diastolic: parseFloat(form.bp_diastolic) || null,
      notes: form.notes || null,
      risk_score: result.score,
      risk_level: result.level,
      risk_breakdown: result.breakdown,
    })

    if (err) { setError(err.message); setSaving(false); return }
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8 animate-slide-up">
          <h1 className="section-title">New Emergency Intake</h1>
          <p className="text-slate-400 text-sm mt-1">Fill in your current symptoms and vitals. This will be scored and sent to the hospital dashboard.</p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6 animate-stagger">
          {/* Symptoms */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-white text-base mb-1">Symptoms <span className="text-red-400">*</span></h2>
            <p className="text-xs text-slate-500 mb-4">Select all that apply</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SYMPTOM_OPTIONS.map(({ value, label }) => {
                const selected = form.symptoms.includes(value)
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => toggleSymptom(value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all border text-left ${
                      selected
                        ? 'bg-teal-500/15 border-teal-500/40 text-teal-300'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-300'
                    }`}
                  >
                    <div className={`w-3.5 h-3.5 rounded flex-shrink-0 flex items-center justify-center border ${selected ? 'bg-teal-500 border-teal-500' : 'border-slate-600'}`}>
                      {selected && <CheckCircle className="w-3 h-3 text-slate-950" />}
                    </div>
                    <span className="leading-tight">{label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Severity & Duration */}
          <div className="card p-6 space-y-5">
            <h2 className="font-display font-semibold text-white text-base">Severity & Duration</h2>
            <div>
              <label className="label">Overall Severity</label>
              <div className="flex gap-3">
                {['mild', 'moderate', 'severe'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, severity: s }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize border transition-all ${
                      form.severity === s
                        ? s === 'severe' ? 'bg-red-500/20 border-red-500/40 text-red-300'
                          : s === 'moderate' ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                          : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Duration (hours)</label>
              <input
                className="input"
                type="number"
                min="0"
                step="0.5"
                placeholder="e.g. 2.5"
                value={form.duration_hours}
                onChange={e => setForm(f => ({ ...f, duration_hours: e.target.value }))}
              />
            </div>
          </div>

          {/* Vitals */}
          <div className="card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <h2 className="font-display font-semibold text-white text-base">Vitals</h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-md">
                <Info className="w-3 h-3" /> Optional but improves scoring
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="label">Temperature (°C)</label>
                <input className="input" type="number" step="0.1" min="30" max="45" placeholder="e.g. 38.5" value={form.temperature} onChange={e => setForm(f => ({ ...f, temperature: e.target.value }))} />
              </div>
              <div>
                <label className="label">Heart Rate (bpm)</label>
                <input className="input" type="number" min="20" max="300" placeholder="e.g. 90" value={form.heart_rate} onChange={e => setForm(f => ({ ...f, heart_rate: e.target.value }))} />
              </div>
              <div>
                <label className="label">Systolic BP (mmHg)</label>
                <input className="input" type="number" min="50" max="250" placeholder="e.g. 120" value={form.bp_systolic} onChange={e => setForm(f => ({ ...f, bp_systolic: e.target.value }))} />
              </div>
              <div>
                <label className="label">Diastolic BP (mmHg)</label>
                <input className="input" type="number" min="30" max="150" placeholder="e.g. 80" value={form.bp_diastolic} onChange={e => setForm(f => ({ ...f, bp_diastolic: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="card p-6">
            <label className="label">Additional Notes</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Any other details you'd like to share with the doctor…"
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
            />
          </div>

          {/* Preview Score */}
          {preview && (
            <div className={`card p-5 border animate-fade-in ${
              preview.level === 'high' ? 'border-red-500/30 bg-red-500/5' :
              preview.level === 'medium' ? 'border-amber-500/30 bg-amber-500/5' :
              'border-emerald-500/30 bg-emerald-500/5'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-white">Risk Score Preview</h3>
                <RiskBadge level={preview.level} score={preview.score} showScore />
              </div>
              <div className="space-y-1.5">
                {Object.entries(preview.breakdown).map(([key, { points, reason }]) => (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-slate-400 capitalize">{reason}</span>
                    <span className="text-slate-300 font-semibold">+{points}</span>
                  </div>
                ))}
                <div className="border-t border-slate-700 pt-2 flex items-center justify-between text-sm font-bold">
                  <span className="text-white">Total Score</span>
                  <span className="text-white">{preview.score} / 100</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handlePreview}
              className="btn-secondary flex-1 py-3"
            >
              Preview Risk Score
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
              disabled={saving}
            >
              {saving ? <><InlineSpinner /> Submitting…</> : <>
                <AlertTriangle className="w-4 h-4" />
                Submit Intake
              </>}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
