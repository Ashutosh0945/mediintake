import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import RiskBadge from '../../components/RiskBadge'
import { PlusCircle, User, FileText, AlertTriangle, Clock, CheckCircle, Bell, Pill, Lock, Edit, Calendar } from 'lucide-react'

const HEALTH_TIPS = [
  "Drink at least 8 glasses of water daily to stay hydrated.",
  "Aim for 7–9 hours of sleep every night for optimal recovery.",
  "A 30-minute walk daily reduces cardiovascular risk significantly.",
  "Eat a balanced diet rich in fruits, vegetables, and whole grains.",
  "Monitor your blood pressure regularly if you are over 40.",
  "Avoid skipping meals — it can spike blood sugar levels.",
  "Practice deep breathing for 5 minutes daily to reduce stress.",
  "Wash hands frequently to prevent the spread of infections.",
  "Limit processed sugar to reduce the risk of diabetes.",
  "Regular health check-ups help catch problems early.",
]

export default function PatientDashboard() {
  const { profile } = useAuth()
  const [intakes, setIntakes] = useState([])
  const [hasMedProfile, setHasMedProfile] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const tip = HEALTH_TIPS[new Date().getDate() % HEALTH_TIPS.length]

  useEffect(() => {
    async function load() {
      const [{ data: intakeData }, { data: medData }, { data: reviewedIntakes }, { data: confirmedAppts }, { data: msgs }] = await Promise.all([
        supabase.from('intakes').select('*').eq('patient_id', profile.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('medical_profiles').select('id').eq('patient_id', profile.id).single(),
        supabase.from('intakes').select('id').eq('patient_id', profile.id).eq('status', 'reviewed'),
        supabase.from('appointments').select('id').eq('patient_id', profile.id).in('status', ['confirmed', 'cancelled']),
        supabase.from('messages').select('id').eq('to_id', profile.id).eq('read', false),
      ])
      setIntakes(intakeData || [])
      setHasMedProfile(!!medData)
      setUnreadCount((reviewedIntakes?.length || 0) + (confirmedAppts?.length || 0) + (msgs?.length || 0))
      setLoading(false)
    }
    if (profile) load()
  }, [profile])

  const counts = {
    total: intakes.length,
    high: intakes.filter(i => i.risk_level === 'high').length,
    medium: intakes.filter(i => i.risk_level === 'medium').length,
    low: intakes.filter(i => i.risk_level === 'low').length,
  }

  return (
    <div className="min-h-screen">
      <Navbar unreadCount={unreadCount} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-6 animate-slide-up flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold text-white">Hello, {profile?.full_name?.split(' ')[0]} 👋</h1>
            <p className="text-slate-400 mt-1">Here's your health intake overview</p>
          </div>
          {unreadCount > 0 && (
            <Link to="/notifications" className="flex items-center gap-2 bg-teal-500/10 border border-teal-500/25 text-teal-300 px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-500/20 transition-colors">
              <Bell className="w-4 h-4" />
              {unreadCount} new notification{unreadCount > 1 ? 's' : ''}
            </Link>
          )}
        </div>

        {/* Health tip */}
        <div className="card p-4 mb-6 border-teal-500/20 bg-teal-500/5 flex items-start gap-3 animate-fade-in">
          <div className="w-8 h-8 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-base">💡</span>
          </div>
          <div>
            <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider mb-0.5">Daily Health Tip</p>
            <p className="text-sm text-slate-300">{tip}</p>
          </div>
        </div>

        {!hasMedProfile && !loading && (
          <Link to="/medical-profile" className="block mb-6 animate-fade-in">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-start gap-3 hover:bg-amber-500/15 transition-colors">
              <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-amber-300 font-semibold text-sm">Complete your Medical Profile</p>
                <p className="text-amber-400/70 text-xs mt-0.5">Your medical history helps doctors make faster decisions during emergencies.</p>
              </div>
            </div>
          </Link>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 animate-stagger">
          <div className="stat-card"><p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total</p><p className="font-display text-3xl font-bold text-white">{counts.total}</p></div>
          <div className="stat-card"><p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">High Risk</p><p className="font-display text-3xl font-bold text-red-400">{counts.high}</p></div>
          <div className="stat-card"><p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Medium</p><p className="font-display text-3xl font-bold text-amber-400">{counts.medium}</p></div>
          <div className="stat-card"><p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Low Risk</p><p className="font-display text-3xl font-bold text-emerald-400">{counts.low}</p></div>
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10 animate-stagger">
          {[
            { to: '/new-intake', label: 'New Intake', sub: 'Report symptoms', icon: PlusCircle, color: 'teal' },
            { to: '/appointments', label: 'Appointments', sub: 'Request visit', icon: Calendar, color: 'blue' },
            { to: '/medication-reminders', label: 'Medications', sub: 'Track reminders', icon: Pill, color: 'violet' },
            { to: '/notifications', label: 'Notifications', sub: unreadCount > 0 ? `${unreadCount} unread` : 'All caught up', icon: Bell, color: 'amber', badge: unreadCount },
            { to: '/medical-profile', label: 'Medical Profile', sub: hasMedProfile ? 'View / edit' : 'Not set up', icon: User, color: 'rose' },
            { to: '/edit-profile', label: 'Edit Profile', sub: 'Name, age, phone', icon: Edit, color: 'slate' },
            { to: '/change-password', label: 'Change Password', sub: 'Update security', icon: Lock, color: 'slate' },
            { to: '/my-intakes', label: 'All Records', sub: 'Intake history', icon: FileText, color: 'slate' },
          ].map(({ to, label, sub, icon: Icon, color, badge }) => (
            <Link key={to} to={to} className="card-hover p-4 flex items-center gap-3 group relative">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors
                ${color === 'teal' ? 'bg-teal-500/15 border border-teal-500/25 group-hover:bg-teal-500/25' :
                  color === 'blue' ? 'bg-blue-500/15 border border-blue-500/25 group-hover:bg-blue-500/25' :
                  color === 'violet' ? 'bg-violet-500/15 border border-violet-500/25 group-hover:bg-violet-500/25' :
                  color === 'amber' ? 'bg-amber-500/15 border border-amber-500/25 group-hover:bg-amber-500/25' :
                  color === 'rose' ? 'bg-rose-500/15 border border-rose-500/25 group-hover:bg-rose-500/25' :
                  'bg-slate-800 border border-slate-700 group-hover:bg-slate-700'}`}>
                <Icon className={`w-4 h-4 ${color === 'teal' ? 'text-teal-400' : color === 'blue' ? 'text-blue-400' : color === 'violet' ? 'text-violet-400' : color === 'amber' ? 'text-amber-400' : color === 'rose' ? 'text-rose-400' : 'text-slate-400'}`} />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
              </div>
              {badge > 0 && <span className="absolute top-2 right-2 w-5 h-5 bg-amber-500 text-slate-950 text-xs font-bold rounded-full flex items-center justify-center">{badge}</span>}
            </Link>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-white">Recent Intakes</h2>
            <Link to="/my-intakes" className="text-teal-400 hover:text-teal-300 text-sm font-medium">View all →</Link>
          </div>
          {loading ? <div className="card p-8 text-center text-slate-500 text-sm">Loading…</div>
          : intakes.length === 0 ? (
            <div className="card p-10 text-center">
              <CheckCircle className="w-10 h-10 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 font-medium">No intakes yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {intakes.map(intake => (
                <div key={intake.id} className="card p-4 flex items-center justify-between gap-4 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-800 rounded-lg flex items-center justify-center"><Clock className="w-4 h-4 text-slate-500" /></div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {Array.isArray(intake.symptoms) ? intake.symptoms.slice(0, 2).map(s => s.replace(/_/g, ' ')).join(', ') : 'Symptoms recorded'}
                        {Array.isArray(intake.symptoms) && intake.symptoms.length > 2 && ` +${intake.symptoms.length - 2} more`}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{new Date(intake.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {intake.status === 'reviewed' && <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" />Reviewed</span>}
                    <RiskBadge level={intake.risk_level} score={intake.risk_score} showScore />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
