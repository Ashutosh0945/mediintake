import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import { InlineSpinner } from '../../components/LoadingSpinner'
import { Pill, Plus, Trash2, Clock, CheckCircle } from 'lucide-react'

const FREQUENCIES = ['Once daily', 'Twice daily', 'Three times daily', 'Every 4 hours', 'Every 6 hours', 'Weekly', 'As needed']
const TIMES = ['Morning', 'Afternoon', 'Evening', 'Night', 'Morning & Night', 'With meals']

export default function MedicationReminders() {
  const { profile } = useAuth()
  const [reminders, setReminders] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ medication: '', dosage: '', frequency: '', time_of_day: '', notes: '' })

  useEffect(() => { if (profile) load() }, [profile])

  async function load() {
    const { data } = await supabase.from('medication_reminders').select('*')
      .eq('patient_id', profile.id).eq('active', true).order('created_at', { ascending: false })
    setReminders(data || [])
    setLoading(false)
  }

  async function handleAdd(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('medication_reminders').insert({ ...form, patient_id: profile.id })
    setForm({ medication: '', dosage: '', frequency: '', time_of_day: '', notes: '' })
    setShowForm(false)
    load()
    setSaving(false)
  }

  async function handleDelete(id) {
    await supabase.from('medication_reminders').update({ active: false }).eq('id', id)
    setReminders(r => r.filter(x => x.id !== id))
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8 animate-slide-up">
          <div>
            <h1 className="section-title flex items-center gap-3"><Pill className="w-6 h-6 text-blue-400" />Medication Reminders</h1>
            <p className="text-slate-400 text-sm mt-1">Track your daily medications</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />Add Medication
          </button>
        </div>

        {showForm && (
          <div className="card p-6 mb-6 animate-slide-up">
            <h2 className="font-display font-semibold text-white mb-4">New Medication Reminder</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Medication Name <span className="text-red-400">*</span></label>
                  <input className="input" type="text" placeholder="e.g. Metformin" value={form.medication} onChange={e => setForm(f => ({...f, medication: e.target.value}))} required />
                </div>
                <div>
                  <label className="label">Dosage</label>
                  <input className="input" type="text" placeholder="e.g. 500mg" value={form.dosage} onChange={e => setForm(f => ({...f, dosage: e.target.value}))} />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Frequency</label>
                  <select className="input" value={form.frequency} onChange={e => setForm(f => ({...f, frequency: e.target.value}))}>
                    <option value="">Select frequency</option>
                    {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Time of Day</label>
                  <select className="input" value={form.time_of_day} onChange={e => setForm(f => ({...f, time_of_day: e.target.value}))}>
                    <option value="">Select time</option>
                    {TIMES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Notes</label>
                <input className="input" type="text" placeholder="e.g. Take with food, avoid alcohol…" value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 py-2.5">Cancel</button>
                <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2 py-2.5" disabled={saving}>
                  {saving ? <><InlineSpinner />Saving…</> : 'Add Reminder'}
                </button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="card p-10 text-center text-slate-500 text-sm">Loading…</div>
        ) : reminders.length === 0 ? (
          <div className="card p-12 text-center">
            <Pill className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No medication reminders</p>
            <p className="text-slate-600 text-sm mt-1">Add your medications to keep track of them.</p>
          </div>
        ) : (
          <div className="space-y-3 animate-stagger">
            {reminders.map(r => (
              <div key={r.id} className="card p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500/15 border border-blue-500/25 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Pill className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{r.medication} {r.dosage && <span className="text-slate-400 font-normal text-sm">— {r.dosage}</span>}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                      {r.frequency && <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-teal-500" />{r.frequency}</span>}
                      {r.time_of_day && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{r.time_of_day}</span>}
                    </div>
                    {r.notes && <p className="text-xs text-slate-500 mt-1.5 italic">{r.notes}</p>}
                  </div>
                </div>
                <button onClick={() => handleDelete(r.id)} className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
