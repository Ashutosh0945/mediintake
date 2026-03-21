import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import { InlineSpinner } from '../../components/LoadingSpinner'
import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, Plus } from 'lucide-react'

const STATUS_STYLES = {
  pending:   { cls: 'bg-amber-500/15 text-amber-400 border-amber-500/25',   icon: AlertCircle, label: 'Pending' },
  confirmed: { cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25', icon: CheckCircle, label: 'Confirmed' },
  cancelled: { cls: 'bg-red-500/15 text-red-400 border-red-500/25',         icon: XCircle,    label: 'Cancelled' },
}

export default function AppointmentRequest() {
  const { profile } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ reason: '', preferred_date: '', preferred_time: '', notes: '' })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => { if (profile) load() }, [profile])

  async function load() {
    const { data } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', profile.id)
      .order('created_at', { ascending: false })
    setAppointments(data || [])
    setLoading(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    const { error: err } = await supabase.from('appointments').insert({
      patient_id: profile.id,
      reason: form.reason,
      preferred_date: form.preferred_date,
      preferred_time: form.preferred_time || null,
      notes: form.notes || null,
    })
    if (err) { setError(err.message) }
    else {
      setForm({ reason: '', preferred_date: '', preferred_time: '', notes: '' })
      setShowForm(false)
      load()
    }
    setSaving(false)
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <div>
            <h1 className="section-title">Appointments</h1>
            <p className="text-slate-400 text-sm mt-1">Request and track your hospital appointments</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Request
          </button>
        </div>

        {/* New appointment form */}
        {showForm && (
          <div className="card p-6 mb-6 animate-slide-up">
            <h2 className="font-display font-semibold text-white mb-4">New Appointment Request</h2>
            {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Reason for Visit <span className="text-red-400">*</span></label>
                <input className="input" type="text" placeholder="e.g. Follow-up checkup, Fever, Eye pain…" value={form.reason} onChange={set('reason')} required />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Preferred Date <span className="text-red-400">*</span></label>
                  <input className="input" type="date" min={new Date().toISOString().split('T')[0]} value={form.preferred_date} onChange={set('preferred_date')} required />
                </div>
                <div>
                  <label className="label">Preferred Time</label>
                  <select className="input" value={form.preferred_time} onChange={set('preferred_time')}>
                    <option value="">Any time</option>
                    <option value="morning">Morning (9am–12pm)</option>
                    <option value="afternoon">Afternoon (12pm–4pm)</option>
                    <option value="evening">Evening (4pm–7pm)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Additional Notes</label>
                <textarea className="input resize-none" rows={3} placeholder="Any additional information for the doctor…" value={form.notes} onChange={set('notes')} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 py-2.5">Cancel</button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5" disabled={saving}>
                  {saving ? <><InlineSpinner /> Submitting…</> : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Appointment list */}
        {loading ? (
          <div className="card p-10 text-center text-slate-500 text-sm">Loading…</div>
        ) : appointments.length === 0 ? (
          <div className="card p-12 text-center">
            <Calendar className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No appointments yet</p>
            <p className="text-slate-600 text-sm mt-1">Click "New Request" to schedule one.</p>
          </div>
        ) : (
          <div className="space-y-3 animate-stagger">
            {appointments.map(appt => {
              const s = STATUS_STYLES[appt.status] || STATUS_STYLES.pending
              const Icon = s.icon
              return (
                <div key={appt.id} className="card p-5">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-semibold text-white">{appt.reason}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(appt.preferred_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</span>
                        {appt.preferred_time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{appt.preferred_time}</span>}
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 rounded-full text-xs font-semibold ${s.cls}`}>
                      <Icon className="w-3 h-3" />{s.label}
                    </span>
                  </div>
                  {appt.notes && <p className="text-sm text-slate-400 mt-3 pt-3 border-t border-slate-800">{appt.notes}</p>}
                  {appt.admin_note && (
                    <div className="mt-3 pt-3 border-t border-slate-800">
                      <p className="text-xs text-teal-400 font-semibold mb-1">Hospital Note</p>
                      <p className="text-sm text-slate-300">{appt.admin_note}</p>
                    </div>
                  )}
                  <p className="text-xs text-slate-600 mt-2">Requested {new Date(appt.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
