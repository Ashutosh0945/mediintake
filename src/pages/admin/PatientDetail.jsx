import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import RiskBadge from '../../components/RiskBadge'
import { ArrowLeft, Droplets, AlertCircle, Pill, Phone, User, Heart, Activity, CheckCircle, Save, MessageSquare, XCircle, Send } from 'lucide-react'
import { InlineSpinner } from '../../components/LoadingSpinner'

export default function PatientDetail() {
  const { id } = useParams()
  const [patient, setPatient] = useState(null)
  const [medProfile, setMedProfile] = useState(null)
  const [intakes, setIntakes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMessage, setShowMessage] = useState(false)
  const [showDischarge, setShowDischarge] = useState(false)
  const [msgForm, setMsgForm] = useState({ subject: '', body: '' })
  const [sending, setSending] = useState(false)
  const [msgSent, setMsgSent] = useState(false)
  const [discharging, setDischarging] = useState(false)

  useEffect(() => { load() }, [id])

  async function load() {
    const [{ data: p }, { data: m }, { data: i }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', id).single(),
      supabase.from('medical_profiles').select('*').eq('patient_id', id).single(),
      supabase.from('intakes').select('*').eq('patient_id', id).order('created_at', { ascending: false }),
    ])
    setPatient(p); setMedProfile(m); setIntakes(i || [])
    setLoading(false)
  }

  async function sendMessage(e) {
    e.preventDefault()
    setSending(true)
    const { data: me } = await supabase.from('profiles').select('id').eq('id', (await supabase.auth.getUser()).data.user.id).single()
    await supabase.from('messages').insert({ from_id: me.id, to_id: id, subject: msgForm.subject, body: msgForm.body })
    setMsgSent(true); setSending(false)
    setMsgForm({ subject: '', body: '' })
    setTimeout(() => { setMsgSent(false); setShowMessage(false) }, 2000)
  }

  async function dischargePatient() {
    setDischarging(true)
    await supabase.from('profiles').update({ is_discharged: true, discharged_at: new Date().toISOString() }).eq('id', id)
    load()
    setDischarging(false)
    setShowDischarge(false)
  }

  async function undischarge() {
    await supabase.from('profiles').update({ is_discharged: false, discharged_at: null }).eq('id', id)
    load()
  }

  if (loading) return <div className="min-h-screen"><Navbar /><div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-2 border-slate-700 border-t-teal-500 rounded-full animate-spin" /></div></div>
  if (!patient) return <div className="min-h-screen"><Navbar /><div className="p-10 text-slate-400 text-center">Patient not found.</div></div>

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/admin" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-200 text-sm mb-6 transition-colors"><ArrowLeft className="w-4 h-4" />Back</Link>

        {patient.is_discharged && (
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-slate-400 text-sm"><XCircle className="w-4 h-4 text-slate-500" />Patient discharged on {new Date(patient.discharged_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div>
            <button onClick={undischarge} className="btn-secondary text-xs py-1.5 px-3">Re-admit</button>
          </div>
        )}

        <div className="card p-6 mb-6 animate-slide-up">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-teal-500/15 border border-teal-500/25 rounded-2xl flex items-center justify-center"><User className="w-7 h-7 text-teal-400" /></div>
              <div>
                <h1 className="font-display text-2xl font-bold text-white">{patient.full_name}</h1>
                <p className="text-slate-400 text-sm mt-0.5">{patient.age && `${patient.age} yrs`}{patient.gender && ` · ${patient.gender}`}{patient.email && ` · ${patient.email}`}</p>
                {patient.phone && <p className="text-slate-500 text-xs mt-0.5">{patient.phone}</p>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {intakes[0] && <RiskBadge level={intakes[0].risk_level} score={intakes[0].risk_score} showScore />}
              {intakes[0] && <Link to={`/admin/emergency/${intakes[0].id}`} className="btn-danger text-xs py-1.5 px-3">Emergency View</Link>}
              <button onClick={() => setShowMessage(!showMessage)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />Message
              </button>
              {!patient.is_discharged && (
                <button onClick={() => setShowDischarge(true)} className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5" />Discharge
                </button>
              )}
            </div>
          </div>

          {/* Message form */}
          {showMessage && (
            <div className="mt-5 pt-5 border-t border-slate-800 animate-fade-in">
              <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-blue-400" />Send Message to Patient</h3>
              {msgSent ? (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm px-4 py-3 rounded-xl flex items-center gap-2"><CheckCircle className="w-4 h-4" />Message sent!</div>
              ) : (
                <form onSubmit={sendMessage} className="space-y-3">
                  <input className="input" type="text" placeholder="Subject (e.g. Appointment confirmed, Lab results ready)" value={msgForm.subject} onChange={e => setMsgForm(f => ({...f, subject: e.target.value}))} required />
                  <textarea className="input resize-none" rows={3} placeholder="Message to patient…" value={msgForm.body} onChange={e => setMsgForm(f => ({...f, body: e.target.value}))} required />
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowMessage(false)} className="btn-secondary flex-1 py-2 text-sm">Cancel</button>
                    <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2 py-2 text-sm" disabled={sending}>
                      {sending ? <><InlineSpinner />Sending…</> : <><Send className="w-3.5 h-3.5" />Send</>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Discharge confirm */}
          {showDischarge && (
            <div className="mt-5 pt-5 border-t border-slate-800 animate-fade-in">
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p className="text-red-300 font-semibold text-sm mb-1">Confirm Discharge</p>
                <p className="text-red-400/70 text-xs mb-3">This marks the patient as discharged. You can re-admit them later if needed.</p>
                <div className="flex gap-2">
                  <button onClick={() => setShowDischarge(false)} className="btn-secondary flex-1 py-2 text-sm">Cancel</button>
                  <button onClick={dischargePatient} disabled={discharging} className="flex-1 py-2 text-sm bg-red-500 hover:bg-red-400 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all">
                    {discharging ? <><InlineSpinner />…</> : 'Confirm Discharge'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            {medProfile ? (
              <>
                <div className="card p-4"><h2 className="font-display font-semibold text-white text-sm mb-2 flex items-center gap-2"><Droplets className="w-4 h-4 text-red-400" />Blood Group</h2><p className={`font-display text-3xl font-bold ${medProfile.blood_group ? 'text-red-400' : 'text-slate-600'}`}>{medProfile.blood_group || 'Not set'}</p></div>
                {medProfile.allergies && <div className="card p-4"><h2 className="font-display font-semibold text-white text-sm mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-amber-400" />Allergies</h2><p className="text-sm text-slate-300">{medProfile.allergies}</p></div>}
                {medProfile.current_medications && <div className="card p-4"><h2 className="font-display font-semibold text-white text-sm mb-2 flex items-center gap-2"><Pill className="w-4 h-4 text-blue-400" />Medications</h2><p className="text-sm text-slate-300">{medProfile.current_medications}</p></div>}
                {medProfile.emergency_contact_name && <div className="card p-4"><h2 className="font-display font-semibold text-white text-sm mb-2 flex items-center gap-2"><Phone className="w-4 h-4 text-teal-400" />Emergency Contact</h2><p className="text-sm text-white font-medium">{medProfile.emergency_contact_name}</p>{medProfile.emergency_contact_relation && <p className="text-xs text-slate-500">{medProfile.emergency_contact_relation}</p>}{medProfile.emergency_contact_phone && <p className="text-sm text-teal-400 mt-1 font-medium">{medProfile.emergency_contact_phone}</p>}</div>}
                {medProfile.chronic_conditions?.length > 0 && <div className="card p-4"><h2 className="font-display font-semibold text-white text-sm mb-2 flex items-center gap-2"><Heart className="w-4 h-4 text-red-400" />Chronic Conditions</h2><div className="flex flex-wrap gap-1.5">{medProfile.chronic_conditions.map(c => <span key={c} className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full capitalize">{c.replace(/_/g, ' ')}</span>)}</div></div>}
              </>
            ) : <div className="card p-6 text-center text-slate-500 text-sm">No medical profile on file.</div>}
          </div>

          <div className="lg:col-span-2">
            <h2 className="font-display font-semibold text-white mb-4">Intake History ({intakes.length})</h2>
            {intakes.length === 0
              ? <div className="card p-8 text-center text-slate-500 text-sm">No intakes on record.</div>
              : <div className="space-y-3">{intakes.map((intake, idx) => <IntakeRow key={intake.id} intake={intake} isLatest={idx === 0} onUpdate={load} />)}</div>}
          </div>
        </div>
      </main>
    </div>
  )
}

function IntakeRow({ intake, isLatest, onUpdate }) {
  const [expanded, setExpanded] = useState(false)
  const [notes, setNotes] = useState(intake.doctor_notes || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function markReviewed() {
    setSaving(true)
    await supabase.from('intakes').update({ status: 'reviewed', doctor_notes: notes || null, reviewed_at: new Date().toISOString() }).eq('id', intake.id)
    setSaved(true)
    setTimeout(() => { setSaved(false); onUpdate() }, 1500)
    setSaving(false)
  }

  return (
    <div className="card overflow-hidden">
      <button className="w-full p-4 flex items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors text-left" onClick={() => setExpanded(!expanded)}>
        <div>
          <p className="text-xs text-slate-500">{new Date(intake.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}{isLatest && <span className="ml-2 text-teal-400 font-semibold">Latest</span>}</p>
          <p className="text-sm text-slate-300 capitalize mt-0.5">{Array.isArray(intake.symptoms) ? intake.symptoms.map(s => s.replace(/_/g, ' ')).join(', ') : '–'}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {intake.status === 'reviewed' ? <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" />Reviewed</span> : <span className="text-xs text-amber-400">Pending</span>}
          <RiskBadge level={intake.risk_level} score={intake.risk_score} showScore />
        </div>
      </button>
      {expanded && (
        <div className="border-t border-slate-800 p-4 space-y-4 animate-fade-in">
          <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
            <span className={`capitalize font-medium ${intake.severity === 'severe' ? 'text-red-400' : intake.severity === 'moderate' ? 'text-amber-400' : 'text-emerald-400'}`}>{intake.severity}</span>
            {intake.heart_rate && <span className="flex items-center gap-1"><Activity className="w-3 h-3" />{intake.heart_rate} bpm</span>}
            {intake.temperature && <span>{intake.temperature}°C</span>}
            {intake.bp_systolic && <span>{intake.bp_systolic}/{intake.bp_diastolic} mmHg</span>}
          </div>
          {intake.notes && <p className="text-xs text-slate-400 bg-slate-800/50 rounded-xl p-3">{intake.notes}</p>}
          <div>
            <label className="label">Doctor's Notes</label>
            <textarea className="input resize-none" rows={3} placeholder="Add clinical notes, diagnosis, follow-up instructions…" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          {intake.status !== 'reviewed' && (
            <button onClick={markReviewed} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
              {saving ? <><InlineSpinner />Saving…</> : saved ? <><CheckCircle className="w-4 h-4" />Marked!</> : <><Save className="w-4 h-4" />Save & Mark Reviewed</>}
            </button>
          )}
          {intake.status === 'reviewed' && intake.doctor_notes && (
            <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-3">
              <p className="text-xs text-teal-400 font-semibold mb-1">Saved Notes</p>
              <p className="text-sm text-slate-300">{intake.doctor_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
