import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import RiskBadge from '../../components/RiskBadge'
import { Search, Users, AlertTriangle, CheckCircle, Clock, ChevronRight, Download, Calendar, Stethoscope, XCircle } from 'lucide-react'

function exportCSV(intakes) {
  const headers = ['Patient Name','Age','Gender','Email','Symptoms','Severity','Risk Level','Risk Score','HR','Temp','BP','Status','Date']
  const rows = intakes.map(i => [i.profiles?.full_name||'',i.profiles?.age||'',i.profiles?.gender||'',i.profiles?.email||'',Array.isArray(i.symptoms)?i.symptoms.join('; '):'',i.severity||'',i.risk_level||'',i.risk_score||0,i.heart_rate||'',i.temperature||'',i.bp_systolic?`${i.bp_systolic}/${i.bp_diastolic}`:'',i.status||'pending',new Date(i.created_at).toLocaleString('en-IN')])
  const csv = [headers,...rows].map(r=>r.map(v=>`"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv],{type:'text/csv'})
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href=url; a.download=`mediintake-${new Date().toISOString().slice(0,10)}.csv`; a.click()
  URL.revokeObjectURL(url)
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
    // Fetch intakes with profiles join
    const { data: iData, error: iError } = await supabase
      .from('intakes')
      .select('*, profiles(id,full_name,age,gender,phone,email,is_discharged)')
      .order('risk_score',{ascending:false})
      .order('created_at',{ascending:false})

    if (iError) console.error('intakes error:', iError)

    // Fetch appointments WITHOUT profiles join first
    const { data: aData, error: aError } = await supabase
      .from('appointments')
      .select('*')
      .order('created_at',{ascending:false})

    if (aError) console.error('appointments error:', aError)
    console.log('appointments fetched:', aData?.length, aData)

    // If we got appointments, fetch their patient profiles separately
    let appointmentsWithProfiles = aData || []
    if (aData && aData.length > 0) {
      const patientIds = [...new Set(aData.map(a => a.patient_id))]
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', patientIds)
      
      if (profileData) {
        const profileMap = {}
        profileData.forEach(p => { profileMap[p.id] = p })
        appointmentsWithProfiles = aData.map(a => ({
          ...a,
          profiles: profileMap[a.patient_id] || null
        }))
      }
    }

    setIntakes(iData||[])
    setAppointments(appointmentsWithProfiles)
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

  const highRiskUnreviewed = intakes.filter(i=>i.risk_level==='high'&&i.status==='pending')
  const filtered = intakes
    .filter(i=>riskFilter==='all'||i.risk_level===riskFilter)
    .filter(i=>statusFilter==='all'||i.status===statusFilter)
    .filter(i=>{
      if(!search) return true
      const n=i.profiles?.full_name?.toLowerCase()||''
      const e=i.profiles?.email?.toLowerCase()||''
      return n.includes(search.toLowerCase())||e.includes(search.toLowerCase())
    })
    .filter(i=>{
      if(dateFrom&&new Date(i.created_at)<new Date(dateFrom)) return false
      if(dateTo&&new Date(i.created_at)>new Date(dateTo+'T23:59:59')) return false
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
            <button onClick={()=>exportCSV(intakes)} className="btn-secondary flex items-center gap-2 text-sm py-2 px-3">
              <Download className="w-3.5 h-3.5" />Export CSV
            </button>
          </div>
        </div>

        {highRiskUnreviewed.length>0 && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-2xl px-5 py-4 flex items-center gap-3 animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-red-400 font-semibold text-sm">{highRiskUnreviewed.length} high-risk patient{highRiskUnreviewed.length>1?'s':''} awaiting review</p>
              <p className="text-red-400/70 text-xs mt-0.5">{highRiskUnreviewed.map(i=>i.profiles?.full_name||'Unknown').join(', ')}</p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card p-4 mb-6 flex flex-wrap gap-3 items-center animate-fade-in">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input className="input pl-9" placeholder="Search by name or email…" value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
          <select className="input w-auto" value={riskFilter} onChange={e=>setRiskFilter(e.target.value)}>
            <option value="all">All Risk Levels</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
          <select className="input w-auto" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
          </select>
          <input type="date" className="input w-auto" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} placeholder="From" />
          <input type="date" className="input w-auto" value={dateTo} onChange={e=>setDateTo(e.target.value)} placeholder="To" />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 mb-6">
          {[
            {id:'intakes',label:'Intakes',count:counts.total},
            {id:'appointments',label:'Appointments',count:pendingAppts,badge:pendingAppts>0}
          ].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${tab===t.id?'border-teal-500 text-teal-400':'border-transparent text-slate-400 hover:text-slate-200'}`}>
              {t.label}
              {t.badge
                ? <span className="bg-amber-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold">{t.count}</span>
                : <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full">{t.count}</span>
              }
            </button>
          ))}
        </div>

        {/* Intakes tab */}
        {tab==='intakes' && (
          loading ? (
            <div className="card p-10 text-center text-slate-500 text-sm">Loading…</div>
          ) : filtered.length===0 ? (
            <div className="card p-12 text-center"><Users className="w-10 h-10 text-slate-700 mx-auto mb-3" /><p className="text-slate-400 font-medium">No intakes match your filters</p></div>
          ) : (
            <div className="card overflow-hidden animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-12 px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide border-b border-slate-800 bg-slate-900/50">
                <div className="sm:col-span-3">Patient</div>
                <div className="sm:col-span-4">Symptoms</div>
                <div className="sm:col-span-2">Risk</div>
                <div className="sm:col-span-2">Date</div>
                <div className="sm:col-span-1"></div>
              </div>
              {filtered.map(intake=>(
                <div key={intake.id} className={`grid grid-cols-1 sm:grid-cols-12 items-center px-4 py-3.5 gap-2 hover:bg-slate-800/30 transition-colors ${intake.profiles?.is_discharged?'opacity-50':''} ${intake.risk_level==='high'?'border-l-2 border-red-500/60':intake.risk_level==='medium'?'border-l-2 border-amber-500/60':'border-l-2 border-emerald-500/60'}`}>
                  <div className="sm:col-span-3 flex items-center gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{intake.profiles?.full_name||'Unknown'}</p>
                      {intake.profiles?.is_discharged && <XCircle className="w-3 h-3 text-slate-500 inline" title="Discharged" />}
                      <p className="text-xs text-slate-500">{intake.profiles?.age&&`Age ${intake.profiles.age}`}{intake.profiles?.gender&&` · ${intake.profiles.gender}`}</p>
                    </div>
                  </div>
                  <div className="sm:col-span-4">
                    <p className="text-sm text-slate-300 line-clamp-1">{Array.isArray(intake.symptoms)?intake.symptoms.slice(0,3).map(s=>s.replace(/_/g,' ')).join(', '):'—'}</p>
                    <p className="text-xs text-slate-500 mt-0.5 capitalize">{intake.severity||'—'} severity</p>
                  </div>
                  <div className="sm:col-span-2"><RiskBadge level={intake.risk_level} score={intake.risk_score} showScore /></div>
                  <div className="sm:col-span-2 text-xs text-slate-500">
                    <p>{new Date(intake.created_at).toLocaleDateString('en-IN',{dateStyle:'medium'})}</p>
                    <p className={`mt-0.5 font-medium ${intake.status==='reviewed'?'text-teal-400':'text-amber-400'}`}>{intake.status==='reviewed'?'✓ Reviewed':'⏳ Pending'}</p>
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <Link to={`/admin/patient/${intake.profiles?.id}`} className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition-colors"><ChevronRight className="w-3.5 h-3.5" /></Link>
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* Appointments tab */}
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
    reload()
    setUpdating(null)
  }

  if (appointments.length === 0) {
    return (
      <div className="card p-12 text-center">
        <Calendar className="w-10 h-10 text-slate-700 mx-auto mb-3" />
        <p className="text-slate-400 font-medium">No appointment requests yet</p>
        <p className="text-slate-500 text-sm mt-1">Patient appointment requests will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {appointments.map(appt => (
        <AppointmentRow key={appt.id} appt={appt} onUpdate={updateAppointment} updating={updating===appt.id} />
      ))}
    </div>
  )
}

function AppointmentRow({ appt, onUpdate, updating }) {
  const [note, setNote] = useState(appt.admin_note||'')
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="font-semibold text-white">{appt.profiles?.full_name || appt.patient_id?.slice(0,8) + '…'}</p>
          <p className="text-sm text-slate-400 mt-0.5">{appt.reason}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(appt.preferred_date).toLocaleDateString('en-IN',{dateStyle:'medium'})}
            </span>
            {appt.preferred_time && <span className="capitalize">{appt.preferred_time}</span>}
            {appt.profiles?.email && <span>{appt.profiles.email}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border capitalize ${appt.status==='confirmed'?'bg-emerald-500/15 text-emerald-400 border-emerald-500/25':appt.status==='cancelled'?'bg-red-500/15 text-red-400 border-red-500/25':'bg-amber-500/15 text-amber-400 border-amber-500/25'}`}>
            {appt.status}
          </span>
          <button onClick={()=>setExpanded(!expanded)} className="btn-secondary text-xs py-1.5 px-3">
            {expanded?'Close':'Respond'}
          </button>
        </div>
      </div>
      {appt.notes && (
        <p className="text-sm text-slate-400 mt-3 pt-3 border-t border-slate-800">
          <span className="text-slate-500 text-xs">Patient note: </span>{appt.notes}
        </p>
      )}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 animate-fade-in">
          <input className="input" type="text" placeholder="Hospital note (e.g. Confirmed 10am Dr. Sharma)" value={note} onChange={e=>setNote(e.target.value)} />
          <div className="flex gap-2">
            <button onClick={()=>onUpdate(appt.id,'confirmed',note)} disabled={updating} className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-1.5">
              {updating?'…':<><CheckCircle className="w-3.5 h-3.5"/>Confirm</>}
            </button>
            <button onClick={()=>onUpdate(appt.id,'cancelled',note)} disabled={updating} className="btn-danger flex-1 py-2 text-sm flex items-center justify-center gap-1.5">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
