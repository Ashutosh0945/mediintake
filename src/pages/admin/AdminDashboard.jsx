import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import RiskBadge from '../../components/RiskBadge'
import { Search, Users, AlertTriangle, CheckCircle, Clock, ChevronRight, Siren, Download, BarChart2, Calendar, Stethoscope, XCircle } from 'lucide-react'

function exportCSV(intakes) {
  const headers = ['Patient Name','Age','Gender','Email','Symptoms','Severity','Risk Level','Risk Score','Heart Rate','Temperature','BP','Status','Discharged','Date']
  const rows = intakes.map(i => [i.profiles?.full_name||'',i.profiles?.age||'',i.profiles?.gender||'',i.profiles?.email||'',Array.isArray(i.symptoms)?i.symptoms.join('; '):'',i.severity||'',i.risk_level||'',i.risk_score||0,i.heart_rate||'',i.temperature||'',i.bp_systolic?`${i.bp_systolic}/${i.bp_diastolic}`:'',i.status||'pending',i.profiles?.is_discharged?'Yes':'No',new Date(i.created_at).toLocaleString('en-IN')])
  const csv = [headers,...rows].map(r=>r.map(v=>`"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv],{type:'text/csv'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href=url; a.download=`mediintake-${new Date().toISOString().slice(0,10)}.csv`; a.click()
  URL.revokeObjectURL(url)
}

function SimpleBar({ label, value, max, color }) {
  const pct = max ? Math.round((value/max)*100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-16 text-right">{label}</span>
      <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{width:`${pct}%`}} />
      </div>
      <span className="text-xs font-semibold text-white w-5">{value}</span>
    </div>
  )
}

export default function AdminDashboard() {
  const [intakes, setIntakes] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [riskFilter, setRiskFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [tab, setTab] = useState('intakes')

  useEffect(() => {
    load()
    const channel = supabase.channel('admin-live')
      .on('postgres_changes',{event:'*',schema:'public',table:'intakes'},load)
      .on('postgres_changes',{event:'*',schema:'public',table:'appointments'},load)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function load() {
    const [{data:iData},{data:aData}] = await Promise.all([
      supabase.from('intakes').select('*, profiles(id,full_name,age,gender,phone,email,is_discharged)').order('risk_score',{ascending:false}).order('created_at',{ascending:false}),
      supabase.from('appointments').select('*, profiles(full_name,email)').order('created_at',{ascending:false}),
    ])
    setIntakes(iData||[]); setAppointments(aData||[])
    setLoading(false)
  }

  const counts = {
    total: intakes.length,
    high: intakes.filter(i=>i.risk_level==='high').length,
    medium: intakes.filter(i=>i.risk_level==='medium').length,
    low: intakes.filter(i=>i.risk_level==='low').length,
    pending: intakes.filter(i=>i.status==='pending').length,
    reviewed: intakes.filter(i=>i.status==='reviewed').length,
  }

  const highRiskUnreviewed = intakes.filter(i => i.risk_level === 'high' && i.status === 'pending')

  const filtered = intakes
    .filter(i => riskFilter==='all'||i.risk_level===riskFilter)
    .filter(i => statusFilter==='all'||i.status===statusFilter)
    .filter(i => {
      if (!search) return true
      const name = i.profiles?.full_name?.toLowerCase()||''
      const email = i.profiles?.email?.toLowerCase()||''
      return name.includes(search.toLowerCase())||email.includes(search.toLowerCase())
    })
    .filter(i => {
      if (dateFrom && new Date(i.created_at) < new Date(dateFrom)) return false
      if (dateTo && new Date(i.created_at) > new Date(dateTo + 'T23:59:59')) return false
      return true
    })

  const pendingAppts = appointments.filter(a=>a.status==='pending').length

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6 animate-slide-up flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="section-title">Hospital Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">All patient submissions, sorted by risk priority</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 px-3 py-1.5 rounded-lg">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
              <span className="text-xs text-teal-400 font-medium">Live</span>
            </div>
            <Link to="/admin/doctor-profile" className="btn-secondary flex items-center gap-2 text-sm py-2 px-3">
              <Stethoscope className="w-3.5 h-3.5" />My Profile
            </Link>
            <button onClick={() => exportCSV(intakes)} className="btn-secondary flex items-center gap-2 text-sm py-2 px-3">
              <Download className="w-3.5 h-3.5" />Export CSV
            </button>
          </div>
        </div>

        {/* Priority alert */}
        {highRiskUnreviewed.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/40 rounded-2xl p-4 mb-6 animate-fade-in flex items-center gap-3">
            <Siren className="w-5 h-5 text-red-400 flex-shrink-0 animate-pulse" />
            <div className="flex-1">
              <p className="text-red-300 font-semibold text-sm">⚠ {highRiskUnreviewed.length} High-Risk Patient{highRiskUnreviewed.length > 1 ? 's' : ''} Awaiting Review</p>
              <p className="text-red-400/70 text-xs mt-0.5">{highRiskUnreviewed.map(i => i.profiles?.full_name).join(', ')}</p>
            </div>
            <button onClick={() => { setRiskFilter('high'); setStatusFilter('pending') }} className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 px-3 py-1.5 rounded-lg transition-colors flex-shrink-0">
              Show only
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 animate-stagger">
          <div className="stat-card"><div className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-wider"><Users className="w-3.5 h-3.5" />Total</div><p className="font-display text-3xl font-bold text-white">{counts.total}</p></div>
          <div className="stat-card border-red-500/20"><div className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-wider"><Siren className="w-3.5 h-3.5 text-red-400" />High Risk</div><p className="font-display text-3xl font-bold text-red-400">{counts.high}</p></div>
          <div className="stat-card border-amber-500/20"><div className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-wider"><AlertTriangle className="w-3.5 h-3.5 text-amber-400" />Pending</div><p className="font-display text-3xl font-bold text-amber-400">{counts.pending}</p></div>
          <div className="stat-card border-emerald-500/20"><div className="flex items-center gap-2 text-xs text-slate-500 font-semibold uppercase tracking-wider"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" />Reviewed</div><p className="font-display text-3xl font-bold text-emerald-400">{counts.reviewed}</p></div>
        </div>

        {/* Chart */}
        <div className="card p-5 mb-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4"><BarChart2 className="w-4 h-4 text-teal-400" /><h2 className="font-display font-semibold text-white text-sm">Risk Distribution</h2></div>
          <div className="space-y-3">
            <SimpleBar label="High" value={counts.high} max={counts.total} color="bg-red-500" />
            <SimpleBar label="Medium" value={counts.medium} max={counts.total} color="bg-amber-500" />
            <SimpleBar label="Low" value={counts.low} max={counts.total} color="bg-emerald-500" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 border-b border-slate-800">
          {[{id:'intakes',label:'Intakes',count:counts.total},{id:'appointments',label:'Appointments',badge:pendingAppts>0,count:pendingAppts}].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab===t.id?'border-teal-500 text-teal-400':'border-transparent text-slate-400 hover:text-slate-200'}`}>
              {t.label}
              {t.badge && <span className="bg-amber-500 text-slate-950 text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">{t.count}</span>}
            </button>
          ))}
        </div>

        {tab === 'intakes' && (
          <>
            {/* Filters */}
            <div className="flex flex-col gap-3 mb-5">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input className="input pl-9" placeholder="Search by patient name or email…" value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {['all','high','medium','low'].map(f => (
                    <button key={f} onClick={() => setRiskFilter(f)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize border transition-all ${riskFilter===f ? f==='high'?'badge-high':f==='medium'?'badge-medium':f==='low'?'badge-low':'bg-teal-500/15 border-teal-500/40 text-teal-300' : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600'}`}>
                      {f==='all'?'All':f}
                    </button>
                  ))}
                  <button onClick={() => setStatusFilter(statusFilter==='pending'?'all':'pending')}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${statusFilter==='pending'?'bg-amber-500/15 border-amber-500/40 text-amber-300':'bg-slate-800/50 border-slate-700 text-slate-400'}`}>
                    Pending only
                  </button>
                </div>
              </div>
              {/* Date range */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-500 font-medium">Date range:</span>
                <input type="date" className="input py-1.5 text-xs w-auto" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                <span className="text-slate-600 text-xs">to</span>
                <input type="date" className="input py-1.5 text-xs w-auto" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                {(dateFrom || dateTo) && <button onClick={() => { setDateFrom(''); setDateTo('') }} className="text-xs text-slate-500 hover:text-slate-300 underline">Clear</button>}
                <span className="text-xs text-slate-600">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {loading ? <div className="card p-10 text-center text-slate-500 text-sm">Loading…</div>
            : filtered.length===0 ? <div className="card p-12 text-center"><Clock className="w-10 h-10 text-slate-700 mx-auto mb-3" /><p className="text-slate-400 font-medium">No intakes found</p></div>
            : (
              <div className="card overflow-hidden">
                <div className="hidden sm:grid grid-cols-12 px-4 py-3 border-b border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <div className="col-span-1">Risk</div><div className="col-span-3">Patient</div><div className="col-span-3">Symptoms</div><div className="col-span-2">Vitals</div><div className="col-span-1">Status</div><div className="col-span-1">Time</div><div className="col-span-1" />
                </div>
                <div className="divide-y divide-slate-800">
                  {filtered.map(intake => (
                    <div key={intake.id} className={`grid grid-cols-1 sm:grid-cols-12 items-center px-4 py-3.5 gap-2 hover:bg-slate-800/30 transition-colors ${intake.profiles?.is_discharged ? 'opacity-50' : ''} ${intake.risk_level==='high'?'border-l-2 border-red-500/60':intake.risk_level==='medium'?'border-l-2 border-amber-500/60':'border-l-2 border-emerald-500/60'}`}>
                      <div className="col-span-1"><RiskBadge level={intake.risk_level} score={intake.risk_score} showScore /></div>
                      <div className="col-span-3">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold text-white">{intake.profiles?.full_name||'Unknown'}</p>
                          {intake.profiles?.is_discharged && <XCircle className="w-3 h-3 text-slate-500" title="Discharged" />}
                        </div>
                        <p className="text-xs text-slate-500">{intake.profiles?.age&&`Age ${intake.profiles.age}`}{intake.profiles?.gender&&` · ${intake.profiles.gender}`}</p>
                      </div>
                      <div className="col-span-3"><p className="text-sm text-slate-300 capitalize">{Array.isArray(intake.symptoms)?intake.symptoms.slice(0,2).map(s=>s.replace(/_/g,' ')).join(', '):'–'}{Array.isArray(intake.symptoms)&&intake.symptoms.length>2&&` +${intake.symptoms.length-2}`}</p><p className="text-xs text-slate-500 capitalize mt-0.5">{intake.severity} severity</p></div>
                      <div className="col-span-2 text-xs text-slate-400 space-y-0.5">{intake.heart_rate&&<div>HR: {intake.heart_rate} bpm</div>}{intake.temperature&&<div>Temp: {intake.temperature}°C</div>}{intake.bp_systolic&&<div>BP: {intake.bp_systolic}/{intake.bp_diastolic}</div>}</div>
                      <div className="col-span-1">{intake.status==='reviewed'?<span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Done</span>:<span className="text-xs text-amber-400">Pending</span>}</div>
                      <div className="col-span-1 text-xs text-slate-500">{new Date(intake.created_at).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}<br/>{new Date(intake.created_at).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                      <div className="col-span-1 flex items-center gap-1 justify-end">
                        <Link to={`/admin/emergency/${intake.id}`} className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors" title="Emergency View"><Siren className="w-3.5 h-3.5" /></Link>
                        <Link to={`/admin/patient/${intake.profiles?.id}`} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors"><ChevronRight className="w-3.5 h-3.5" /></Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab==='appointments' && <AppointmentsTab appointments={appointments} reload={load} />}
      </main>
    </div>
  )
}

function AppointmentsTab({ appointments, reload }) {
  const [updating, setUpdating] = useState(null)
  async function updateAppointment(id, status, adminNote) {
    setUpdating(id)
    await supabase.from('appointments').update({status, admin_note: adminNote||null}).eq('id', id)
    reload(); setUpdating(null)
  }
  return appointments.length===0 ? (
    <div className="card p-12 text-center"><Calendar className="w-10 h-10 text-slate-700 mx-auto mb-3" /><p className="text-slate-400 font-medium">No appointment requests</p></div>
  ) : (
    <div className="space-y-3">{appointments.map(appt => <AppointmentRow key={appt.id} appt={appt} onUpdate={updateAppointment} updating={updating===appt.id} />)}</div>
  )
}

function AppointmentRow({ appt, onUpdate, updating }) {
  const [note, setNote] = useState(appt.admin_note||'')
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="font-semibold text-white">{appt.profiles?.full_name}</p>
          <p className="text-sm text-slate-400 mt-0.5">{appt.reason}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(appt.preferred_date).toLocaleDateString('en-IN',{dateStyle:'medium'})}</span>
            {appt.preferred_time && <span>{appt.preferred_time}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${appt.status==='confirmed'?'bg-emerald-500/15 text-emerald-400 border-emerald-500/25':appt.status==='cancelled'?'bg-red-500/15 text-red-400 border-red-500/25':'bg-amber-500/15 text-amber-400 border-amber-500/25'}`}>{appt.status}</span>
          <button onClick={() => setExpanded(!expanded)} className="btn-secondary text-xs py-1.5 px-3">{expanded?'Close':'Respond'}</button>
        </div>
      </div>
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 animate-fade-in">
          <input className="input" type="text" placeholder="Hospital note (e.g. Confirmed 10am Dr. Sharma)" value={note} onChange={e => setNote(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={() => onUpdate(appt.id,'confirmed',note)} disabled={updating} className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-1.5">{updating?'…':<><CheckCircle className="w-3.5 h-3.5" />Confirm</>}</button>
            <button onClick={() => onUpdate(appt.id,'cancelled',note)} disabled={updating} className="btn-danger flex-1 py-2 text-sm flex items-center justify-center gap-1.5">Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}
