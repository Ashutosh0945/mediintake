import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabaseClient'
import Navbar from '../../components/Navbar'
import { Bell, CheckCircle, Calendar, MessageSquare, Clock, CheckCheck } from 'lucide-react'

export default function Notifications() {
  const { profile } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (profile) load() }, [profile])

  async function load() {
    const [{ data: intakes }, { data: appts }, { data: msgs }] = await Promise.all([
      supabase.from('intakes').select('id, risk_level, risk_score, status, reviewed_at, doctor_notes, created_at')
        .eq('patient_id', profile.id).eq('status', 'reviewed').order('reviewed_at', { ascending: false }),
      supabase.from('appointments').select('*').eq('patient_id', profile.id)
        .in('status', ['confirmed', 'cancelled']).order('created_at', { ascending: false }),
      supabase.from('messages').select('*').eq('to_id', profile.id).order('created_at', { ascending: false }),
    ])

    const notifications = [
      ...(intakes || []).map(i => ({
        id: `intake-${i.id}`, type: 'intake', read: true,
        title: 'Your intake has been reviewed',
        body: i.doctor_notes ? `Doctor's note: ${i.doctor_notes}` : `Risk level: ${i.risk_level}`,
        time: i.reviewed_at || i.created_at,
        icon: CheckCircle, color: 'teal',
      })),
      ...(appts || []).map(a => ({
        id: `appt-${a.id}`, type: 'appointment', read: true,
        title: a.status === 'confirmed' ? '✅ Appointment Confirmed' : '❌ Appointment Cancelled',
        body: a.admin_note || `Your request for "${a.reason}" has been ${a.status}.`,
        time: a.created_at,
        icon: Calendar, color: a.status === 'confirmed' ? 'emerald' : 'red',
      })),
      ...(msgs || []).map(m => ({
        id: `msg-${m.id}`, type: 'message', read: m.read,
        title: m.subject,
        body: m.body,
        time: m.created_at,
        icon: MessageSquare, color: 'blue',
        msgId: m.id,
      })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time))

    setItems(notifications)
    setLoading(false)
  }

  async function markOneRead(item) {
    if (item.read) return
    if (item.type === 'message' && item.msgId) {
      await supabase.from('messages').update({ read: true }).eq('id', item.msgId)
    }
    setItems(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n))
  }

  async function markAllRead() {
    const unreadMsgIds = items
      .filter(n => !n.read && n.type === 'message' && n.msgId)
      .map(n => n.msgId)
    if (unreadMsgIds.length > 0) {
      await supabase.from('messages').update({ read: true }).in('id', unreadMsgIds)
    }
    setItems(prev => prev.map(n => ({ ...n, read: true })))
  }

  const unreadCount = items.filter(n => !n.read).length

  const colorMap = {
    teal:    'bg-teal-500/15 text-teal-400 border-teal-500/25',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    red:     'bg-red-500/15 text-red-400 border-red-500/25',
    blue:    'bg-blue-500/15 text-blue-400 border-blue-500/25',
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-slide-up flex-wrap gap-3">
          <div>
            <h1 className="section-title flex items-center gap-3">
              <Bell className="w-7 h-7 text-teal-400" /> Notifications
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              {items.length} total · {unreadCount} unread
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="btn-secondary flex items-center gap-2 text-sm py-2 px-4"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="card p-10 text-center text-slate-500 text-sm">Loading…</div>
        ) : items.length === 0 ? (
          <div className="card p-12 text-center">
            <Bell className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 font-medium">No notifications yet</p>
            <p className="text-slate-600 text-sm mt-1">Updates about your intakes and appointments will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3 animate-stagger">
            {items.map(item => {
              const Icon = item.icon
              return (
                <div
                  key={item.id}
                  className={`card p-4 flex gap-4 transition-all ${!item.read ? 'border-blue-500/30 bg-blue-500/3' : 'opacity-80'}`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${colorMap[item.color]}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold ${item.read ? 'text-slate-300' : 'text-white'}`}>
                        {item.title}
                      </p>
                      {!item.read && (
                        <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 mt-1.5 animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">{item.body}</p>
                    <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                      <p className="text-xs text-slate-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.time).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                      {!item.read && (
                        <button
                          onClick={() => markOneRead(item)}
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Mark as read
                        </button>
                      )}
                      {item.read && (
                        <span className="text-xs text-slate-600 flex items-center gap-1">
                          <CheckCheck className="w-3 h-3" /> Read
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}