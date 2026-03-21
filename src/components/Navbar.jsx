import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Activity, LogOut, User, LayoutDashboard, FileText, PlusCircle, Menu, X, Calendar, Edit, Bell, Pill, Lock, Stethoscope } from 'lucide-react'
import { useState } from 'react'

export default function Navbar({ unreadCount = 0 }) {
  const { profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => { await signOut(); navigate('/') }

  const patientLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/new-intake', label: 'New Intake', icon: PlusCircle },
    { to: '/my-intakes', label: 'Records', icon: FileText },
    { to: '/appointments', label: 'Appointments', icon: Calendar },
    { to: '/medication-reminders', label: 'Medications', icon: Pill },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { to: '/medical-profile', label: 'Medical Profile', icon: User },
    { to: '/edit-profile', label: 'Edit Profile', icon: Edit },
    { to: '/change-password', label: 'Password', icon: Lock },
  ]
  const adminLinks = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/doctor-profile', label: 'My Profile', icon: Stethoscope },
  ]
  const links = isAdmin ? adminLinks : patientLinks
  const isActive = (path) => location.pathname === path

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to={isAdmin?'/admin':'/dashboard'} className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-teal-500/20 border border-teal-500/40 rounded-lg flex items-center justify-center group-hover:bg-teal-500/30 transition-colors">
            <Activity className="w-4 h-4 text-teal-400" />
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight">Medi<span className="text-teal-400">Intake</span></span>
        </Link>

        <div className="hidden lg:flex items-center gap-0.5">
          {links.map(({ to, label, icon: Icon, badge }) => (
            <Link key={to} to={to} className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${isActive(to)?'bg-teal-500/15 text-teal-300 border border-teal-500/25':'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
              <Icon className="w-3.5 h-3.5" />{label}
              {badge > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-slate-950 text-xs font-bold rounded-full flex items-center justify-center">{badge}</span>}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-800/60 border border-slate-700 rounded-lg">
            <div className="w-2 h-2 bg-teal-400 rounded-full" />
            <span className="text-xs text-slate-300 font-medium">{profile?.full_name?.split(' ')[0]}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-md ${isAdmin?'bg-violet-500/20 text-violet-400':'bg-teal-500/20 text-teal-400'}`}>{isAdmin?'Admin':'Patient'}</span>
          </div>
          <button onClick={handleSignOut} className="p-2 text-slate-500 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors" title="Sign out"><LogOut className="w-4 h-4" /></button>
          <button className="lg:hidden p-2 text-slate-400 hover:text-slate-200" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen?<X className="w-5 h-5" />:<Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-slate-950/95 px-4 py-3 flex flex-col gap-1 animate-fade-in">
          {links.map(({ to, label, icon: Icon, badge }) => (
            <Link key={to} to={to} onClick={() => setMenuOpen(false)}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive(to)?'bg-teal-500/15 text-teal-300':'text-slate-400 hover:text-slate-200 hover:bg-slate-800'}`}>
              <Icon className="w-4 h-4" />{label}
              {badge>0&&<span className="ml-auto w-5 h-5 bg-amber-500 text-slate-950 text-xs font-bold rounded-full flex items-center justify-center">{badge}</span>}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
